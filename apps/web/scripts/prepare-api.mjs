// Prepares the serverless API for Netlify:
//   1. Bundles the Express app into netlify/functions/_server.cjs (esbuild).
//   2. Copies the Prisma schema into the client and generates the client HERE
//      (so the generated engine lands in client/node_modules for the function).
import { execSync } from 'node:child_process';
import { mkdirSync, copyFileSync } from 'node:fs';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

console.log('› Bundling Express API with esbuild...');
run(
  'npx esbuild ../server/src/app.ts --bundle --platform=node --target=node20 ' +
    '--external:@prisma/client --outfile=netlify/functions/_server.cjs --format=cjs --log-level=warning',
);

console.log('› Copying Prisma schema into client...');
mkdirSync('prisma', { recursive: true });
copyFileSync('../server/prisma/schema.prisma', 'prisma/schema.prisma');

console.log('› Generating Prisma client (into client/node_modules)...');
run('npx prisma generate --schema=prisma/schema.prisma');

console.log('✓ API prepared.');
