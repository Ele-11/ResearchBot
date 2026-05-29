/**
 * Search Module Tests
 *
 * Unit tests for Bing Search API integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import the search module
import {
  createBingSearchClient,
  search,
  createDefaultSearchClient,
  SearchError,
} from '../../src/lib/search';
import type { SearchResult } from '../../src/lib/types';

describe('SearchResult types', () => {
  it('should have correct structure for search result', () => {
    const result: SearchResult = {
      title: 'Test Page',
      url: 'https://example.com',
      snippet: 'This is a test snippet',
    };
    expect(result.title).toBe('Test Page');
    expect(result.url).toBe('https://example.com');
    expect(result.snippet).toBe('This is a test snippet');
  });
});

describe('SearchError', () => {
  it('should create error with status code', () => {
    const error = new SearchError('Test error', 401);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe('SearchError');
  });

  it('should default statusCode to undefined', () => {
    const error = new SearchError('Test error');
    expect(error.statusCode).toBeUndefined();
  });
});

describe('createBingSearchClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.BING_SEARCH_API_KEY;
    delete process.env.BING_SEARCH_ENDPOINT;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw error when API key is not provided', () => {
    expect(() => createBingSearchClient({})).toThrow(
      'BING_SEARCH_API_KEY environment variable is not set'
    );
  });

  it('should use provided API key over environment variable', () => {
    process.env.BING_SEARCH_API_KEY = 'env-api-key';
    const client = createBingSearchClient({ apiKey: 'config-api-key' });
    expect(client).toBeDefined();
  });

  it('should create client with default config', () => {
    process.env.BING_SEARCH_API_KEY = 'test-key';
    const client = createBingSearchClient({});
    expect(client).toBeDefined();
    expect(typeof client.search).toBe('function');
  });

  it('should use custom endpoint from config', () => {
    process.env.BING_SEARCH_API_KEY = 'test-key';
    const customEndpoint = 'https://custom.bing.search.api/v7';
    const client = createBingSearchClient({
      endpoint: customEndpoint,
    });
    expect(client).toBeDefined();
  });
});

describe('search function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.BING_SEARCH_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return array of search results', async () => {
    process.env.BING_SEARCH_API_KEY = 'test-key';

    const mockResponse = {
      webPages: {
        value: [
          {
            name: 'Result 1',
            url: 'https://example.com/1',
            snippet: 'First result snippet',
          },
          {
            name: 'Result 2',
            url: 'https://example.com/2',
            snippet: 'Second result snippet',
          },
        ],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const results = await search('test query');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      title: 'Result 1',
      url: 'https://example.com/1',
      snippet: 'First result snippet',
    });
  });

  it('should respect limit option', async () => {
    process.env.BING_SEARCH_API_KEY = 'test-key';

    const mockResponse = {
      webPages: {
        value: [
          { name: 'Result 1', url: 'https://example.com/1', snippet: 'Snippet 1' },
          { name: 'Result 2', url: 'https://example.com/2', snippet: 'Snippet 2' },
          { name: 'Result 3', url: 'https://example.com/3', snippet: 'Snippet 3' },
        ],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const results = await search('test query', { limit: 2 });
    expect(results).toHaveLength(2);
  });

  it('should throw SearchError on API failure', async () => {
    process.env.BING_SEARCH_API_KEY = 'test-key';

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    await expect(search('test query')).rejects.toThrow();
  });

  it('should throw SearchError with status code', async () => {
    process.env.BING_SEARCH_API_KEY = 'test-key';

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    try {
      await search('test query');
    } catch (error) {
      expect(error).toBeInstanceOf(SearchError);
      expect((error as SearchError).statusCode).toBe(403);
    }
  });

  it('should handle empty results', async () => {
    process.env.BING_SEARCH_API_KEY = 'test-key';

    const mockResponse = {
      webPages: {
        value: [],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const results = await search('test query');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(0);
  });

  it('should handle missing webPages in response', async () => {
    process.env.BING_SEARCH_API_KEY = 'test-key';

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const results = await search('test query');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(0);
  });
});

describe('createDefaultSearchClient', () => {
  it('should create client using environment variables', () => {
    process.env.BING_SEARCH_API_KEY = 'env-key';
    const client = createDefaultSearchClient();
    expect(client).toBeDefined();
  });
});