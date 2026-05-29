/**
 * LLM Module
 *
 * MiniMax/DeepSeek LLM integration with type definitions.
 */

// Types
export type {
  LLMConfig,
  ChatMessage,
  StreamChunk,
  LLMResponse
} from './types.js';

export { LLMError } from './types.js';

// Client
export {
  createLLMClient,
  streamToGenerator
} from './client.js';