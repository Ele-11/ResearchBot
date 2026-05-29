/**
 * Search Types
 */
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchResponse {
  webPages?: {
    value: SearchResult[];
  };
  queryContext?: {
    originalQuery: string;
  };
}

export interface SearchConfig {
  apiKey?: string;
  endpoint?: string;
  limit?: number;
}

export interface SearchOptions {
  limit?: number;
}

export class SearchError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'SearchError';
    this.statusCode = statusCode;
  }
}