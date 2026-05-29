/**
 * Bing Search API Integration
 *
 * Provides web search capability using Bing Search API.
 */

import type { SearchResult, SearchConfig, SearchOptions } from './types';
import { SearchError } from './types';

// Re-export types and SearchError for consumers
export type { SearchResult, SearchConfig, SearchOptions } from './types';
export { SearchError };

// Bing Search API endpoints
const BING_SEARCH_ENDPOINT = 'https://api.bing.microsoft.com/v7.0/search';
const DEFAULT_LIMIT = 10;

/**
 * Get API key from environment or config
 */
function getApiKey(config: SearchConfig): string {
  const apiKey = config.apiKey || process.env.BING_SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error('BING_SEARCH_API_KEY environment variable is not set');
  }
  return apiKey;
}

/**
 * Get endpoint from config or use default
 */
function getEndpoint(config: SearchConfig): string {
  return config.endpoint || process.env.BING_SEARCH_ENDPOINT || BING_SEARCH_ENDPOINT;
}

/**
 * Create Bing Search client with configuration
 */
export function createBingSearchClient(config: SearchConfig = {}) {
  const apiKey = getApiKey(config);
  const endpoint = getEndpoint(config);

  /**
   * Execute a search query
   */
  async function doSearch(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const limit = options?.limit || DEFAULT_LIMIT;

    const url = new URL(endpoint);
    url.searchParams.set('q', query);
    url.searchParams.set('count', limit.toString());
    url.searchParams.set('responseFilter', 'WebPages');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    });

    if (!response.ok) {
      const error = new SearchError(
        `Bing Search API error: ${response.status} ${response.statusText}`,
        response.status
      );
      throw error;
    }

    const data = await response.json() as {
      webPages?: {
        value: Array<{
          name: string;
          url: string;
          snippet: string;
        }>;
      };
    };

    const webPages = data.webPages?.value || [];
    const limitedResults = webPages.slice(0, limit);
    return limitedResults.map((page) => ({
      title: page.name,
      url: page.url,
      snippet: page.snippet,
    }));
  }

  return {
    search: doSearch,
  };
}

/**
 * Standalone search function using environment variables
 */
export async function search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
  const client = createBingSearchClient({});
  return client.search(query, options);
}

/**
 * Create default search client with environment variables
 */
export function createDefaultSearchClient() {
  return createBingSearchClient({});
}