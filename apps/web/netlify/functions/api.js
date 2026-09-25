/**
 * Netlify Function that runs the whole SkillForge Express API (serverless).
 * `_server.cjs` is the esbuild-bundled Express app (see `npm run build:api`).
 * The `/api/*` redirect in netlify.toml routes requests here.
 */
const serverless = require('serverless-http');

// Load the bundled app once. If it throws at load (e.g. missing env var or a
// Prisma engine problem), capture it so we can return a readable error instead
// of an opaque 502 "Runtime exited".
let handlerFn;
let loadError = null;
try {
  const { createApp } = require('./_server.cjs');
  handlerFn = serverless(createApp());
} catch (err) {
  loadError = err;
}

exports.handler = async (event, context) => {
  if (loadError) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'API failed to start',
        error: String((loadError && loadError.message) || loadError),
      }),
    };
  }
  // Normalize the path so Express (routes under /api/v1) sees /api/... regardless
  // of whether Netlify forwards the original path or the function path.
  if (event.path) {
    event.path = event.path.replace(/^\/\.netlify\/functions\/api/, '/api');
  }
  if (event.rawUrl) {
    event.rawUrl = event.rawUrl.replace('/.netlify/functions/api', '/api');
  }
  return handlerFn(event, context);
};
