import { getAiChatStatus } from '../../server/ai-chat.mjs';

export default async (request) => {
  if (request.method !== 'GET') {
    return Response.json(
      { error: { message: 'Method not allowed.' } },
      { status: 405, headers: { Allow: 'GET' } },
    );
  }

  return Response.json(getAiChatStatus(process.env));
};
