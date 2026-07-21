import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const allowedModels = new Set([
  'gemini-3.1-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-3-pro-image',
  'gemini-2.5-flash-image',
]);

async function readJson(request) {
  let body = '';
  for await (const chunk of request) body += chunk;
  return JSON.parse(body || '{}');
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), geminiProxy(env.GEMINI_API_KEY)],
  };
});
