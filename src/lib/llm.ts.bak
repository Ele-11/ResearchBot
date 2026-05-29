/**
 * MiniMax LLM Integration
 *
 * Provides streaming and non-streaming LLM calls using MiniMax API.
 * Compatible with LangChain's chat model interface.
 */

import type {
  LLMConfig,
  ChatMessage,
  StreamChunk,
  LLMResponse,
  LLMError,
} from './types';

// MiniMax API endpoints
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';
const DEFAULT_MODEL = 'MiniMax-Text-01';

/**
 * Get API key from environment variable
 */
function getApiKey(config: LLMConfig): string {
  const apiKey = config.apiKey || process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY environment variable is not set');
  }
  return apiKey;
}

/**
 * Parse SSE stream data
 */
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

/**
 * Convert streaming response to async generator
 */
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

/**
 * Create LLM client configuration
 */
export function createLLMClient(config: LLMConfig = {}) {
  const apiKey = getApiKey(config);
  const baseUrl = config.baseUrl || MINIMAX_BASE_URL;
  const model = config.model || DEFAULT_MODEL;
  const temperature = config.temperature ?? 0.7;
  const maxTokens = config.maxTokens || 2048;

  /**
   * Send non-streaming chat completion request
   */
  async function chat(
    messages: ChatMessage[]
  ): Promise<LLMResponse> {
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
      const error: LLMError = new Error(
        `MiniMax API error: ${response.status} ${response.statusText}`
      );
      error.statusCode = response.status;
      throw error;
    }

    const data = await response.json();

    if (data.error) {
      const error: LLMError = new Error(
        data.error.message || 'MiniMax API error'
      );
      error.code = data.error.code;
      throw error;
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

  /**
   * Send streaming chat completion request
   * Returns an async generator for streaming chunks
   */
  async function streamChat(
    messages: ChatMessage[]
  ): Promise<AsyncGenerator<StreamChunk>> {
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
      const error: LLMError = new Error(
        `MiniMax API error: ${response.status} ${response.statusText}`
      );
      error.statusCode = response.status;
      throw error;
    }

    return streamToGenerator(response);
  }

  /**
   * Simple text generation (non-streaming)
   */
  async function generate(prompt: string): Promise<LLMResponse> {
    return chat([{ role: 'user', content: prompt }]);
  }

  /**
   * Simple streaming text generation
   */
  async function streamGenerate(
    prompt: string
  ): Promise<AsyncGenerator<StreamChunk>> {
    return streamChat([{ role: 'user', content: prompt }]);
  }

  return {
    chat,
    streamChat,
    generate,
    streamGenerate,
  };
}

/**
 * Create default LLM client with environment API key
 */
export function createDefaultLLM(config: LLMConfig = {}) {
  return createLLMClient({
    ...config,
    apiKey: config.apiKey || process.env.MINIMAX_API_KEY,
  });
}

// Export types for consumers
export type { LLMConfig, ChatMessage, StreamChunk, LLMResponse, LLMError };
