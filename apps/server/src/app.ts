/**
 * Application Factory
 */
import http from 'http';
import fs from 'fs';
import { ResearchRouter } from './routes/research';

export interface ServerConfig {
  port: number;
  outputDir: string;
}

/**
 * Create HTTP server with routes
 */
export function createServer(config: ServerConfig): http.Server {
  const { outputDir } = config;

  // Ensure reports directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const researchRouter = new ResearchRouter({ outputDir });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${config.port}`);

    // Health check
    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    // Research API
    if (url.pathname === '/api/research' || url.pathname === '/api/research/stream') {
      await researchRouter.handle(req, res);
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  return server;
}