import { AiChatError, createAiChatReply } from '../../server/ai-chat.mjs';

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const clients = new Map();

function isRateLimited(request) {
  const now = Date.now();
  const clientId = request.headers.get('x-nf-client-connection-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
  const current = clients.get(clientId);

  if (!current || current.resetAt <= now) {
    clients.set(clientId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  current.count += 1;
  if (clients.size > 1_000) {
    for (const [key, value] of clients) {
      if (value.resetAt <= now) clients.delete(key);
    }
  }
  return current.count > RATE_LIMIT;
}

export default async (request) => {
  if (request.method !== 'POST') {
    return Response.json(
      { error: { message: 'Method not allowed.' } },
      { status: 405, headers: { Allow: 'POST' } },
    );
  }

  if (isRateLimited(request)) {
    return Response.json(
      { error: { message: 'Забагато повідомлень. Спробуйте через хвилину.' } },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 100_000) {
      return Response.json(
        { error: { message: 'Запит завеликий.' } },
        { status: 413 },
      );
    }

    const payload = await request.json();
    return Response.json(await createAiChatReply(payload, process.env));
  } catch (error) {
    const status = error instanceof AiChatError ? error.status : 500;
    return Response.json(
      { error: { message: error?.message || 'AI chat request failed.' } },
      { status },
    );
  }
};
