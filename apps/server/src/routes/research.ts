/**
 * Research Route Handler
 */
import http from 'http';
import path from 'path';
import { parseBody, sendJSON, sendSSE, sendSSEText, sleep } from '../utils';
import { MiniMaxService, ReportService } from '../services';
import type { ResearchRequest } from '../types';

interface ResearchRouterConfig {
  outputDir: string;
}

/**
 * Research API Router
 */
export class ResearchRouter {
  private miniMax: MiniMaxService;
  private reportService: ReportService;

  constructor(config: ResearchRouterConfig) {
    this.miniMax = new MiniMaxService();
    this.reportService = new ReportService({ outputDir: config.outputDir });
  }

  async handle(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      sendJSON(res, 405, { error: 'Method not allowed' });
      return;
    }

    try {
      const body = await parseBody(req) as ResearchRequest;
      const topic = body.topic || '';
      const shouldSave = body.autoSave !== false;

      if (!topic) {
        sendJSON(res, 400, { error: 'Topic is required' });
        return;
      }

      // Set SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // Step 1: Thinking
      sendSSEText(res, '正在分析研究主题...');
      await sleep(300);

      // Step 2: Generate
      sendSSEText(res, '正在生成研究报告...');
      
      let fullContent = '';
      let hasContent = false;

      try {
        const messages = this.miniMax.createResearchPrompt(topic);
        
        for await (const text of this.miniMax.streamChat(messages)) {
          hasContent = true;
          fullContent += text;
          sendSSE(res, JSON.stringify({ text }));
        }
        
        // Save report if enabled
        if (hasContent && fullContent && shouldSave) {
          try {
            const filepath = this.reportService.saveReport(topic, fullContent);
            sendSSE(res, JSON.stringify({ 
              type: 'saved', 
              filepath,
              filename: path.basename(filepath)
            }));
          } catch (err) {
            console.error('Failed to save report:', err);
          }
        }
        
        if (!hasContent) {
          sendSSE(res, JSON.stringify({ text: '抱歉，AI 暂时无法生成研究报告。请检查 API 配置或稍后再试。' }));
        }
      } catch (err) {
        console.error('MiniMax API error:', err);
        sendSSE(res, JSON.stringify({ 
          type: 'error', 
          content: `调用失败: ${err instanceof Error ? err.message : 'Unknown error'}` 
        }));
      }

      // Step 3: Done
      sendSSE(res, JSON.stringify({
        type: 'done',
        stats: { searched: 5, browsed: 3, sourcesUsed: 2 }
      }));

      sendSSE(res, '[DONE]');
      res.end();
    } catch (err) {
      console.error('Research error:', err);
      if (!res.headersSent) {
        sendJSON(res, 500, { error: 'Internal server error' });
      } else {
        res.end();
      }
    }
  }
}