/**
 * Search Types
 *
 * Type definitions for Bing Search API integration.
 */

/**
 * Single search result from Bing Search API
 */
export interface SearchResult {
  /** Title of the search result */
  title: string;
  /** URL of the search result */
  url: string;
  /** Snippet/description of the result */
  snippet: string;
}

/**
 * Search API response
 */
export interface SearchResponse {
  /** Web pages in the response */
  webPages?: {
    value: SearchResult[];
  };
  /** Query context */
  queryContext?: {
    originalQuery: string;
  };
}

/**
 * Search configuration options
 */
export interface SearchConfig {
  /** Bing Search API key - reads from BING_SEARCH_API_KEY env var if not provided */
  apiKey?: string;
  /** Custom endpoint URL for Bing Search API */
  endpoint?: string;
  /** Maximum number of results to return (default: 10) */
  limit?: number;
}

/**
 * Search options for the search function
 */
export interface SearchOptions {
  /** Maximum number of results to return (default: 10) */
  limit?: number;
}

/**
 * Search error with HTTP status code
 */
export class SearchError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'SearchError';
    this.statusCode = statusCode;
  }
}