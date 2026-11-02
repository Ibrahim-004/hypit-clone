import { createApp } from '../src/app';

// Vercel serverless entry point for the Express app.
// The catch-all route means /api/v1/* requests reach this function
// with their original path, so the Express routers in src/app.ts
// handle them unchanged. No server.listen() here: Vercel invokes
// the exported app as the request handler.
const app = createApp();
export default app;
