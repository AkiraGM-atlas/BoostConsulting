# BoostConsulting

Use Node.js 22 and npm 10. Keep this repository independent from Atlas credentials and data.

Before changing Next.js code, read the relevant installed guide in `node_modules/next/dist/docs/`.

Checks: `npm run check`, `npm run test:e2e` (after build), `npm audit --audit-level=high`.

Authentication is required by default outside the public route list in `src/proxy.ts`. Check authorization again inside data operations. Keep `.env` files and credentials out of Git.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
