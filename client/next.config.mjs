/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // When the client uses a relative API base ("/api/v1"), proxy those calls to
  // the local API server. This lets a single public URL (e.g. a tunnel) serve
  // the whole app with no CORS — the browser only ever talks to one origin.
  async rewrites() {
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
