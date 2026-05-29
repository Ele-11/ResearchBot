/**
 * Shared Package Exports
 */

// Search module
export type {
  SearchResult,
  SearchResponse,
  SearchConfig,
  SearchOptions
} from './search/types.js';
export { SearchError } from './search/types.js';
export {
  createBingSearchClient,
  createDefaultSearchClient,
  search
} from './search/client.js';

// LLM module
export type {
  LLMConfig,
  ChatMessage,
  StreamChunk,
  LLMResponse
} from './llm/types.js';
export { LLMError } from './llm/types.js';
export {
  createLLMClient,
  streamToGenerator
} from './llm/client.js';