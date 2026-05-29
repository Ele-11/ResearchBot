/**
 * MiniMax LLM Integration (Server-side)
 *
 * Provides streaming and non-streaming LLM calls using MiniMax API.
 */

const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';
const DEFAULT_MODEL = 'MiniMax-Text-01';

interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseUrl?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface StreamChunk {
  text: string;
  done: boolean;
}

interface LLMResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

function getApiKey(config: LLMConfig): string {
  const apiKey = config.apiKey || process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY environment variable is not set');
  }
  return apiKey;
}

function parseSSEData(line: string): string | null {
  if (!line.startsWith('data: ')) {
    return null;
  }
  const data = line.slice(6).trim();
  if (data === '[DONE]') {
    return null;
  }
  return data;
}

export async function* streamToGenerator(
  response: Response
): AsyncGenerator<StreamChunk> {
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        yield { text: '', done: true };
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const data = parseSSEData(line);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content || '';
            if (text) {
              yield { text, done: false };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function createLLMClient(config: LLMConfig = {}) {
  const apiKey = getApiKey(config);
  const baseUrl = config.baseUrl || MINIMAX_BASE_URL;
  const model = config.model || DEFAULT_MODEL;
  const temperature = config.temperature ?? 0.7;
  const maxTokens = config.maxTokens || 2048;

  async function chat(messages: ChatMessage[]): Promise<LLMResponse> {
    const url = `${baseUrl}/text/chatcompletion_v2`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'MiniMax API error');
    }

    return {
      text: data.choices?.[0]?.message?.content || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens || 0,
            completionTokens: data.usage.completion_tokens || 0,
            totalTokens: data.usage.total_tokens || 0,
          }
        : undefined,
    };
  }

  async function streamChat(messages: ChatMessage[]): Promise<AsyncGenerator<StreamChunk>> {
    const url = `${baseUrl}/text/chatcompletion_v2`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.status} ${response.statusText}`);
    }

    return streamToGenerator(response);
  }

  return {
    chat,
    streamChat,
  };
}

export type { LLMConfig, ChatMessage, StreamChunk, LLMResponse };