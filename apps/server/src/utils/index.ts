/**
 * Utility Functions
 */

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse JSON body from request
 */
export function parseBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Send JSON response
 */
export function sendJSON(res: http.ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

/**
 * Send SSE message
 */
export function sendSSE(res: http.ServerResponse, data: string): void {
  res.write(`data: ${data}\n\n`);
}

/**
 * Send text as SSE event
 */
export function sendSSEText(res: http.ServerResponse, text: string): void {
  sendSSE(res, JSON.stringify({ text }));
}

import http from 'http';