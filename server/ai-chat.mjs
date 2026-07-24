const DEFAULT_SYSTEM_PROMPT = [
  'You are Lumina Assistant, the in-product AI helper for Lumina AI Image Creator.',
  'Answer clearly and practically. Help with prompts, image generation, Flow State, Blueprints, upscaling, plans, and the API.',
  'Match the language used by the user. If you are unsure about a product-specific fact, say so instead of inventing it.',
].join(' ');

const PROVIDER_ALIASES = new Map([
  ['openai', 'openai-compatible'],
  ['openai-compatible', 'openai-compatible'],
  ['openai_compatible', 'openai-compatible'],
  ['openrouter', 'openai-compatible'],
  ['groq', 'openai-compatible'],
  ['deepseek', 'openai-compatible'],
  ['mistral', 'openai-compatible'],
  ['xai', 'openai-compatible'],
  ['together', 'openai-compatible'],
  ['custom', 'openai-compatible'],
  ['gemini', 'gemini'],
  ['google', 'gemini'],
  ['anthropic', 'anthropic'],
  ['claude', 'anthropic'],
]);

const DEFAULTS = {
  'openai-compatible': {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-5-mini',
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.5-flash',
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-sonnet-4-5',
  },
};

export class AiChatError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'AiChatError';
    this.status = status;
  }
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function inferProvider(env) {
  const requested = clean(env.AI_PROVIDER).toLowerCase();
  if (requested) return PROVIDER_ALIASES.get(requested) || '';
  if (clean(env.AI_API_KEY) || clean(env.OPENAI_API_KEY)) return 'openai-compatible';
  if (clean(env.ANTHROPIC_API_KEY)) return 'anthropic';
  if (clean(env.GEMINI_API_KEY)) return 'gemini';
  return 'openai-compatible';
}

function resolveApiKey(provider, env) {
  if (clean(env.AI_API_KEY)) return clean(env.AI_API_KEY);
  if (provider === 'gemini') return clean(env.GEMINI_API_KEY);
  if (provider === 'anthropic') return clean(env.ANTHROPIC_API_KEY);
  return clean(env.OPENAI_API_KEY);
}

export function getAiChatConfig(env = process.env) {
  const provider = inferProvider(env);
  const defaults = DEFAULTS[provider];
  const apiKey = resolveApiKey(provider, env);

  if (!defaults) {
    return {
      configured: false,
      provider: clean(env.AI_PROVIDER) || 'unknown',
      model: clean(env.AI_MODEL),
      error: 'Невідомий AI_PROVIDER. Використайте openai-compatible, gemini або anthropic.',
    };
  }

  const baseUrl = trimTrailingSlash(clean(env.AI_BASE_URL) || defaults.baseUrl);
  const model = clean(env.AI_MODEL) || defaults.model;

  return {
    configured: Boolean(apiKey && model && baseUrl),
    provider,
    providerLabel: provider === 'openai-compatible'
      ? (clean(env.AI_PROVIDER_LABEL) || 'OpenAI-compatible')
      : provider === 'gemini' ? 'Google Gemini' : 'Anthropic Claude',
    apiKey,
    baseUrl,
    model,
    systemPrompt: clean(env.AI_SYSTEM_PROMPT) || DEFAULT_SYSTEM_PROMPT,
    siteUrl: clean(env.AI_SITE_URL),
    appName: clean(env.AI_APP_NAME),
    error: apiKey ? '' : 'AI API key не налаштований. Додайте AI_API_KEY до .env.local.',
  };
}

export function getAiChatStatus(env = process.env) {
  const config = getAiChatConfig(env);
  return {
    configured: config.configured,
    provider: config.providerLabel || config.provider,
    model: config.model,
    message: config.configured ? '' : config.error,
  };
}

function normalizeMessages(input) {
  if (!Array.isArray(input)) {
    throw new AiChatError('Поле messages має бути масивом.', 400);
  }

  const messages = input
    .slice(-24)
    .map((message) => ({
      role: message?.role === 'assistant' ? 'assistant' : 'user',
      content: clean(message?.content).slice(0, 12000),
    }))
    .filter((message) => message.content);

  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    throw new AiChatError('Додайте повідомлення користувача.', 400);
  }

  return messages;
}

function extractTextContent(content) {
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';
  return content
    .filter((item) => item?.type === 'text' || typeof item?.text === 'string')
    .map((item) => clean(item?.text))
    .filter(Boolean)
    .join('\n')
    .trim();
}

function extractProviderError(result, fallback) {
  return clean(result?.error?.message)
    || clean(result?.message)
    || clean(result?.error)
    || fallback;
}

async function postJson(url, options, fetchImpl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      ...options,
      signal: controller.signal,
    });
    const text = await response.text();
    let result = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = {};
    }

    if (!response.ok) {
      const message = extractProviderError(
        result,
        `AI provider повернув помилку HTTP ${response.status}.`,
      );
      throw new AiChatError(message, response.status >= 400 && response.status < 500 ? response.status : 502);
    }

    return result;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new AiChatError('AI provider не відповів вчасно. Спробуйте ще раз.', 504);
    }
    if (error instanceof AiChatError) throw error;
    throw new AiChatError(error?.message || 'Не вдалося зв’язатися з AI provider.', 502);
  } finally {
    clearTimeout(timeout);
  }
}

async function callOpenAiCompatible(config, messages, fetchImpl) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };

  if (config.siteUrl) headers['HTTP-Referer'] = config.siteUrl;
  if (config.appName) headers['X-Title'] = config.appName;

  const result = await postJson(
    `${config.baseUrl}/chat/completions`,
    {
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: config.systemPrompt },
          ...messages,
        ],
      }),
    },
    fetchImpl,
  );

  return extractTextContent(result?.choices?.[0]?.message?.content);
}

async function callGemini(config, messages, fetchImpl) {
  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));
  const model = encodeURIComponent(config.model);
  const result = await postJson(
    `${config.baseUrl}/models/${model}:generateContent`,
    {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: config.systemPrompt }] },
        contents,
      }),
    },
    fetchImpl,
  );

  return extractTextContent(result?.candidates?.[0]?.content?.parts);
}

async function callAnthropic(config, messages, fetchImpl) {
  const result = await postJson(
    `${config.baseUrl}/messages`,
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 1200,
        system: config.systemPrompt,
        messages,
      }),
    },
    fetchImpl,
  );

  return extractTextContent(result?.content);
}

export async function createAiChatReply(payload, env = process.env, fetchImpl = fetch) {
  const config = getAiChatConfig(env);
  if (!config.configured) {
    throw new AiChatError(config.error, 503);
  }

  const messages = normalizeMessages(payload?.messages);
  let message = '';

  if (config.provider === 'gemini') {
    message = await callGemini(config, messages, fetchImpl);
  } else if (config.provider === 'anthropic') {
    message = await callAnthropic(config, messages, fetchImpl);
  } else {
    message = await callOpenAiCompatible(config, messages, fetchImpl);
  }

  if (!message) {
    throw new AiChatError('AI provider повернув порожню відповідь.', 502);
  }

  return {
    message,
    provider: config.providerLabel,
    model: config.model,
  };
}
