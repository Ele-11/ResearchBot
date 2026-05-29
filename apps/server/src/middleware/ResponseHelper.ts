/**
 * Response Helper Middleware
 */
import http from 'http';

export class ResponseHelper {
  constructor(private res: http.ServerResponse) {}

  setCors(): void {
    this.res.setHeader('Access-Control-Allow-Origin', '*');
    this.res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    this.res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  json(status: number, data: unknown): void {
    this.res.writeHead(status, { 'Content-Type': 'application/json' });
    this.res.end(JSON.stringify(data));
  }

  sse(data: string): void {
    this.res.write(`data: ${data}\n\n`);
  }

  done(): void {
    this.res.end();
  }
}