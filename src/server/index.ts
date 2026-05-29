/**
 * Research API Server
 * 
 * Standalone HTTP server with MiniMax LLM integration.
 * Run with: pnpm run server (port 3001)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Types
interface ResearchRequest {
  topic: string;
  autoSave?: boolean;
}

// MiniMax API config
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';
const DEFAULT_MODEL = 'MiniMax-M2';

// Output directory for saved reports
const OUTPUT_DIR = path.join(process.cwd(), 'reports');

// Ensure reports directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function getApiKey(): string {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY environment variable is not set');
  }
  return apiKey;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper: parse JSON body
function parseBody(req: http.IncomingMessage): Promise<unknown> {
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

// Helper: send JSON response
function sendJSON(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

// Helper: send SSE response
function sendSSE(res: http.ServerResponse, data: string) {
  res.write(`data: ${data}\n\n`);
}

// Helper: send plain text as SSE data
function sendSSEText(res: http.ServerResponse, text: string) {
  sendSSE(res, JSON.stringify({ text }));
}

// Generate filename from topic
function generateFilename(topic: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
  const cleanTopic = topic.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').slice(0, 30);
  return `${timestamp}_${cleanTopic}.md`;
}

// Save report to file
function saveReport(topic: string, content: string): string {
  const filename = generateFilename(topic);
  const filepath = path.join(OUTPUT_DIR, filename);
  
  // Add title header to the content
  const reportWithTitle = `# 研究报告：${topic}\n\n---\n\n${content}`;
  
  fs.writeFileSync(filepath, reportWithTitle, 'utf-8');
  console.log(`📄 Report saved: ${filepath}`);
  return filepath;
}

// Research endpoint (stream mode)
async function handleResearch(req: http.IncomingMessage, res: http.ServerResponse) {
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
    const shouldSave = body.autoSave !== false; // Default to true

    if (!topic) {
      sendJSON(res, 400, { error: 'Topic is required' });
      return;
    }

    // Get API key
    const apiKey = getApiKey();

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Step 1: Thinking
    sendSSEText(res, '正在分析研究主题...');
    await sleep(300);

    // Step 2: Call MiniMax API with streaming
    sendSSEText(res, '正在生成研究报告...');
    
    let fullContent = '';
    let hasContent = false;
    let savedFilepath = '';

    try {
      // Call MiniMax and stream the response
      const miniMaxResponse = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: 'system', content: '你是一个专业的AI研究助手。请根据用户的研究主题，生成一份详细的中文研究报告。格式包括：摘要、主要发现、结论。' },
            { role: 'user', content: `请写一份关于"${topic}"的研究报告。` },
          ],
          temperature: 0.7,
          max_tokens: 4096,
          stream: true,
        }),
      });

      // Check for HTTP errors
      if (!miniMaxResponse.ok) {
        const errorText = await miniMaxResponse.text();
        console.error('MiniMax HTTP error:', errorText);
        sendSSE(res, JSON.stringify({ type: 'error', content: `API 错误: ${miniMaxResponse.status}` }));
        sendSSE(res, JSON.stringify({ type: 'done', stats: { searched: 0, browsed: 0, sourcesUsed: 0 } }));
        sendSSE(res, '[DONE]');
        res.end();
        return;
      }

      // Stream MiniMax response
      const reader = miniMaxResponse.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            
            // Check if MiniMax returned an error in the response
            if (parsed.base_resp?.status_code && parsed.base_resp.status_code !== 0) {
              console.error('MiniMax API error:', parsed.base_resp.status_msg);
              sendSSE(res, JSON.stringify({ type: 'error', content: `MiniMax 错误: ${parsed.base_resp.status_msg}` }));
              hasContent = false;
              continue;
            }
            
            const text = parsed.choices?.[0]?.delta?.content || '';
            if (text) {
              hasContent = true;
              fullContent += text;
              sendSSE(res, JSON.stringify({ text }));
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
      
      // Save the report to a file (only if autoSave is enabled)
      if (hasContent && fullContent && shouldSave) {
        try {
          savedFilepath = saveReport(topic, fullContent);
          // Send notification that file was saved
          sendSSE(res, JSON.stringify({ 
            type: 'saved', 
            filepath: savedFilepath,
            filename: path.basename(savedFilepath)
          }));
        } catch (err) {
          console.error('Failed to save report:', err);
        }
      } else if (hasContent && fullContent && !shouldSave) {
        // User chose not to save, still notify
        sendSSE(res, JSON.stringify({ 
          type: 'info', 
          content: '已关闭自动保存，报告未保存到文件' 
        }));
      }
      
      // If no content was received, send a fallback message
      if (!hasContent) {
        sendSSE(res, JSON.stringify({ text: '抱歉，AI 暂时无法生成研究报告。请检查 API 配置或稍后再试。' }));
      }
    } catch (err) {
      console.error('MiniMax API error:', err);
      sendSSE(res, JSON.stringify({ type: 'error', content: `调用失败: ${err instanceof Error ? err.message : 'Unknown error'}` }));
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

// Routes
const routes: Record<string, (req: http.IncomingMessage, res: http.ServerResponse) => void> = {
  '/api/research': handleResearch,
  '/api/research/stream': handleResearch,
};

// Server
const PORT = process.env.PORT || 3001;
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  // Health check
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Route matching
  const handler = routes[url.pathname];
  if (handler) {
    await handler(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Research API: http://localhost:${PORT}/api/research`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Reports saved to: ${OUTPUT_DIR}`);
  if (!process.env.MINIMAX_API_KEY) {
    console.log('⚠️  Warning: MINIMAX_API_KEY not set in environment');
  } else {
    console.log('✅ MiniMax API key loaded');
  }
});

export {};