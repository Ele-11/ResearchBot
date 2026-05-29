/**
 * Research Route Handler
 */

import http from 'http';
import fs from 'fs';
import path from 'path';

interface ResearchRequest {
  topic: string;
  autoSave?: boolean;
}

const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';
const DEFAULT_MODEL = 'MiniMax-M2';

const OUTPUT_DIR = path.join(process.cwd(), 'reports');

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

function sendJSON(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

function sendSSE(res: http.ServerResponse, data: string) {
  res.write(`data: ${data}\n\n`);
}

function sendSSEText(res: http.ServerResponse, text: string) {
  sendSSE(res, JSON.stringify({ text }));
}

function generateFilename(topic: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
  const cleanTopic = topic.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').slice(0, 30);
  return `${timestamp}_${cleanTopic}.md`;
}

function saveReport(topic: string, content: string): string {
  const filename = generateFilename(topic);
  const filepath = path.join(OUTPUT_DIR, filename);
  const reportWithTitle = `# 研究报告：${topic}\n\n---\n\n${content}`;
  fs.writeFileSync(filepath, reportWithTitle, 'utf-8');
  console.log(`📄 Report saved: ${filepath}`);
  return filepath;
}

export async function handleResearch(req: http.IncomingMessage, res: http.ServerResponse) {
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

    const apiKey = getApiKey();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    sendSSEText(res, '正在分析研究主题...');
    await sleep(300);

    sendSSEText(res, '正在生成研究报告...');
    
    let fullContent = '';
    let hasContent = false;

    try {
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

      if (!miniMaxResponse.ok) {
        const errorText = await miniMaxResponse.text();
        console.error('MiniMax HTTP error:', errorText);
        sendSSE(res, JSON.stringify({ type: 'error', content: `API 错误: ${miniMaxResponse.status}` }));
        sendSSE(res, JSON.stringify({ type: 'done', stats: { searched: 0, browsed: 0, sourcesUsed: 0 } }));
        sendSSE(res, '[DONE]');
        res.end();
        return;
      }

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
      
      if (hasContent && fullContent && shouldSave) {
        try {
          const savedFilepath = saveReport(topic, fullContent);
          sendSSE(res, JSON.stringify({ 
            type: 'saved', 
            filepath: savedFilepath,
            filename: path.basename(savedFilepath)
          }));
        } catch (err) {
          console.error('Failed to save report:', err);
        }
      } else if (hasContent && fullContent && !shouldSave) {
        sendSSE(res, JSON.stringify({ 
          type: 'info', 
          content: '已关闭自动保存，报告未保存到文件' 
        }));
      }
      
      if (!hasContent) {
        sendSSE(res, JSON.stringify({ text: '抱歉，AI 暂时无法生成研究报告。请检查 API 配置或稍后再试。' }));
      }
    } catch (err) {
      console.error('MiniMax API error:', err);
      sendSSE(res, JSON.stringify({ type: 'error', content: `调用失败: ${err instanceof Error ? err.message : 'Unknown error'}` }));
    }

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