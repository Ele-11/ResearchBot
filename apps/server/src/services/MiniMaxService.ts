/**
 * MiniMax Service
 */
import { config } from '../config';

const MINIMAX_BASE_URL = config.minimax.baseUrl;
const DEFAULT_MODEL = config.minimax.model;

interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Get API key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY environment variable is not set');
  }
  return apiKey;
}

/**
 * Create MiniMax streaming session
 */
export class MiniMaxService {
  private apiKey: string;

  constructor() {
    this.apiKey = getApiKey();
  }

  /**
   * Stream chat completion from MiniMax
   */
  async *streamChat(messages: MiniMaxMessage[]): AsyncGenerator<string> {
    const url = `${MINIMAX_BASE_URL}/text/chatcompletion_v2`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: config.minimax.temperature,
        max_tokens: config.minimax.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MiniMax HTTP error: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
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
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          
          // Check for API errors
          if (parsed.base_resp?.status_code && parsed.base_resp.status_code !== 0) {
            throw new Error(`MiniMax API error: ${parsed.base_resp.status_msg}`);
          }
          
          const text = parsed.choices?.[0]?.delta?.content || '';
          if (text) {
            yield text;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }

  /**
   * Create research prompt messages
   */
  createResearchPrompt(topic: string): MiniMaxMessage[] {
    return [
      {
        role: 'system',
        content: '你是一个专业的AI研究助手。请根据用户的研究主题，生成一份详细的中文研究报告。格式包括：摘要、主要发现、结论。',
      },
      {
        role: 'user',
        content: `请写一份关于"${topic}"的研究报告。`,
      },
    ];
  }
}