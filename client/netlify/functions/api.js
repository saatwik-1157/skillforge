/**
 * Netlify Function that runs the whole SkillForge Express API (serverless).
 * `_server.cjs` is the esbuild-bundled Express app (see `npm run build:api`).
 * The `/api/*` redirect in netlify.toml routes requests here.
 */
const serverless = require('serverless-http');
const { createApp } = require('./_server.cjs');

const handlerFn = serverless(createApp());

exports.handler = async (event, context) => {
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
