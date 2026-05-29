/**
 * Search Module
 */
export type { SearchResult, SearchResponse, SearchConfig, SearchOptions } from './types.js';
export { SearchError } from './types.js';
export { createBingSearchClient, createDefaultSearchClient, search } from './client.js';