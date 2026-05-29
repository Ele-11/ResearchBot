/**
 * Search Module
 *
 * Bing Search API integration with type definitions.
 */

// Types
export type {
  SearchResult,
  SearchResponse,
  SearchConfig,
  SearchOptions
} from './types.js';

export { SearchError } from './types.js';

// Client
export {
  createBingSearchClient,
  createDefaultSearchClient,
  search
} from './client.js';