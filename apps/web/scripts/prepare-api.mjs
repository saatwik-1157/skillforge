// Prepares the serverless API for Netlify:
//   1. Bundles the Express app into netlify/functions/_server.cjs (esbuild).
//   2. Copies the Prisma schema from apps/api/prisma into apps/web/prisma and
//      generates the client HERE (so the generated engine lands in
//      apps/web/node_modules, which netlify.toml ships with the function).
import { execSync } from 'node:child_process';
import { mkdirSync, copyFileSync } from 'node:fs';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

console.log('› Bundling Express API with esbuild...');
run(
  'npx esbuild ../api/src/app.ts --bundle --platform=node --target=node20 ' +
    '--external:@prisma/client --outfile=netlify/functions/_server.cjs --format=cjs --log-level=warning',
);

console.log('› Copying Prisma schema from apps/api into apps/web...');
mkdirSync('prisma', { recursive: true });
copyFileSync('../api/prisma/schema.prisma', 'prisma/schema.prisma');

console.log('› Generating Prisma client (into apps/web/node_modules)...');
run('npx prisma generate --schema=prisma/schema.prisma');

console.log('✓ API prepared.');
