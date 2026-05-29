/**
 * Research Route Handler
 * 
 * Uses ResearchAgent with BingSearchTool to gather information before generating reports.
 */
import http from 'http';
import path from 'path';
import { parseBody, sendJSON, sendSSE, sendSSEText, sleep } from '../utils';
import { ReportService, ResearchAgent } from '../services';
import type { ResearchRequest } from '../types';

interface ResearchRouterConfig {
  outputDir: string;
}

/**
 * Research API Router
 * 
 * Integrates with ResearchAgent which uses BingSearchTool for research.
 */
export class ResearchRouter {
  private researchAgent: ResearchAgent | null = null;
  private reportService: ReportService;

  constructor(config: ResearchRouterConfig) {
    this.reportService = new ReportService({ outputDir: config.outputDir });
  }

  /**
   * Lazy initialize ResearchAgent (only when first request comes in)
   */
  private getResearchAgent(): ResearchAgent {
    if (!this.researchAgent) {
      this.researchAgent = new ResearchAgent();
    }
    return this.researchAgent;
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

      // Get ResearchAgent with BingSearchTool
      const agent = this.getResearchAgent();
      
      let fullContent = '';
      let hasContent = false;

      try {
        // Use ResearchAgent which will:
        // 1. Search for information using BingSearchTool
        // 2. Generate report based on search results
        for await (const text of agent.research(topic)) {
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
        console.error('Research error:', err);
        sendSSE(res, JSON.stringify({ 
          type: 'error', 
          content: `调用失败: ${err instanceof Error ? err.message : 'Unknown error'}` 
        }));
      }

      // Done
      sendSSE(res, JSON.stringify({
        type: 'done',
        stats: { searched: 1, browsed: 0, sourcesUsed: 1 }
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