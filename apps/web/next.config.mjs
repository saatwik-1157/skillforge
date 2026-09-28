import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Pin file tracing to this app. The repo root has its own package-lock.json
  // (root dev tooling); Next infers the workspace root from lockfiles, and a
  // repo-root guess would change the .next/standalone layout the Dockerfile
  // copies (it expects .next/standalone/server.js).
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  // When the client uses a relative API base ("/api/v1"), proxy those calls to
  // the local API server. This lets a single public URL (e.g. a tunnel) serve
  // the whole app with no CORS — the browser only ever talks to one origin.
  async rewrites() {
    // On Netlify, netlify.toml routes /api/* to the serverless function, so skip
    // the dev proxy there. Locally, proxy /api/* to the running API server.
    if (process.env.NETLIFY) return [];
    const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:4055';
    return [{ source: '/api/:path*', destination: `${apiTarget}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
};

export default nextConfig;
