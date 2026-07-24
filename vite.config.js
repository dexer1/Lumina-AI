import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { AiChatError, createAiChatReply, getAiChatStatus } from './server/ai-chat.mjs';

const allowedModels = new Set([
  'gemini-3.1-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-3-pro-image',
  'gemini-2.5-flash-image',
]);

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 100_000) throw new AiChatError('Запит завеликий.', 413);
  }
  return JSON.parse(body || '{}');
}

function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function geminiProxy(apiKey) {
  const middleware = async (request, response, next) => {
    const path = request.url?.split('?')[0];

    if (path === '/api/gemini/status' && request.method === 'GET') {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ configured: Boolean(apiKey) }));
      return;
    }

    if (path !== '/api/gemini/generate' || request.method !== 'POST') {
      next();
      return;
    }

    response.setHeader('Content-Type', 'application/json');
    if (!apiKey) {
      response.statusCode = 500;
      response.end(JSON.stringify({ error: { message: 'GEMINI_API_KEY is missing in .env.local.' } }));
      return;
    }

    try {
      const { model, payload } = await readJson(request);
      if (!allowedModels.has(model)) {
        response.statusCode = 400;
        response.end(JSON.stringify({ error: { message: 'Unsupported image model.' } }));
        return;
      }

      const upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify(payload),
        },
      );
      response.statusCode = upstream.status;
      response.end(await upstream.text());
    } catch (error) {
      response.statusCode = 500;
      response.end(JSON.stringify({ error: { message: error?.message || 'Gemini proxy request failed.' } }));
    }
  };

  return {
    name: 'local-gemini-proxy',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

function aiChatProxy(env) {
  const middleware = async (request, response, next) => {
    const path = request.url?.split('?')[0];

    if (path === '/api/ai/status' && request.method === 'GET') {
      sendJson(response, 200, getAiChatStatus(env));
      return;
    }

    if (path !== '/api/ai/chat' || request.method !== 'POST') {
      next();
      return;
    }

    try {
      const payload = await readJson(request);
      sendJson(response, 200, await createAiChatReply(payload, env));
    } catch (error) {
      sendJson(
        response,
        error instanceof AiChatError ? error.status : 500,
        { error: { message: error?.message || 'AI chat request failed.' } },
      );
    }
  };

  return {
    name: 'local-ai-chat-proxy',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), geminiProxy(env.GEMINI_API_KEY), aiChatProxy(env)],
  };
});
