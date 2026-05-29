/**
 * Bing Search LangChain Tool
 *
 * Implements LangChain Tool interface for web search capability.
 */

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createDefaultSearchClient, SearchError } from '../../lib/search';

/**
 * Bing Search Tool for LangChain
 *
 * Provides web search capability as a LangChain Tool for agent use.
 */
export class BingSearchTool extends Tool {
  /** Tool name identifier */
  name = 'search';

  /** Tool description for LLM context */
  description = 'Search for web URLs related to a query. Use this when you need to find current information, recent news, or specific URLs on the internet.';

  /** Input schema for the tool */
  argsSchema = z.object({
    input: z.string().optional().describe('The search query'),
  });

  /** Search client instance */
  private searchClient = createDefaultSearchClient();

  /**
   * Execute the search tool
   * @param input - The search query
   * @returns Formatted search results as a string
   */
  async _call(input: string): Promise<string> {
    try {
      const results = await this.searchClient.search(input);

      if (results.length === 0) {
        return 'No search results found.';
      }

      // Format results as a list
      const formattedResults = results.map(
        (result, index) => `${index + 1}. ${result.title}\n   URL: ${result.url}\n   ${result.snippet}`
      ).join('\n\n');

      return `Found ${results.length} results:\n\n${formattedResults}`;
    } catch (error) {
      if (error instanceof SearchError) {
        return `Search error (${error.statusCode}): ${error.message}`;
      }
      return `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * Create a search tool instance
 */
export function createSearchTool(): BingSearchTool {
  return new BingSearchTool();
}

// Alias for backward compatibility
export const SearchTool = BingSearchTool;