const allowedModels = new Set([
  'gemini-3.1-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-3-pro-image',
  'gemini-2.5-flash-image',
]);

export default async (request) => {
  if (request.method !== 'POST') {
    return Response.json(
      { error: { message: 'Method not allowed.' } },
      { status: 405, headers: { Allow: 'POST' } },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: { message: 'GEMINI_API_KEY is not configured in Netlify.' } },
      { status: 500 },
    );
  }

  try {
    const { model, payload } = await request.json();
    if (!allowedModels.has(model)) {
      return Response.json(
        { error: { message: 'Unsupported image model.' } },
        { status: 400 },
      );
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

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('Content-Type') || 'application/json' },
    });
  } catch (error) {
    return Response.json(
      { error: { message: error?.message || 'Gemini proxy request failed.' } },
      { status: 500 },
    );
  }
};
