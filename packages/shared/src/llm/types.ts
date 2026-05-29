/**
 * LLM Type Definitions
 *
 * Type definitions for MiniMax/DeepSeek API integration.
 */

/**
 * LLM Configuration
 */
export interface LLMConfig {
  /** Model name (e.g., MiniMax-Text-01, deepseek-vepro) */
  model?: string;
  /** Temperature for generation (0-1) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** API key - read from MINIMAX_API_KEY env var if not provided */
  apiKey?: string;
  /** Base URL for API (optional, defaults to MiniMax API) */
  baseUrl?: string;
}

/**
 * Message for chat completion
 */
export interface ChatMessage {
  /** Role: system, user, or assistant */
  role: 'system' | 'user' | 'assistant';
  /** Message content */
  content: string;
}

/**
 * Stream chunk from streaming response
 */
export interface StreamChunk {
  /** Text delta */
  text: string;
  /** Whether this is the final chunk */
  done: boolean;
}

/**
 * LLM Response (non-streaming)
 */
export interface LLMResponse {
  /** Generated text */
  text: string;
  /** Usage statistics */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * LLM Error
 */
export class LLMError extends Error {
  statusCode?: number;
  code?: string;

  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = 'LLMError';
    this.statusCode = statusCode;
    this.code = code;
  }
}