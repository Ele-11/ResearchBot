/**
 * Bing Search Tool
 */
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createDefaultSearchClient, SearchError } from '@researchbot/shared/search';
import type { BaseResearchTool } from '../base/index.js';

/**
 * BingSearchTool for LangChain
 * 
 * Provides web search capability as a LangChain Tool.
 */
export class BingSearchTool extends Tool {
  name = 'bing_search';
  
  description = 'Search for web URLs related to a query. Use this when you need to find current information, recent news, or specific URLs on the internet.';

  argsSchema = z.object({
    query: z.string().optional().describe('The search query'),
  });

  private searchClient = createDefaultSearchClient();

  async _call(input: string): Promise<string> {
    try {
      const results = await this.searchClient.search(input);

      if (results.length === 0) {
        return 'No search results found.';
      }

      return results
        .map((r, i) => `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.snippet}`)
        .join('\n\n');
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

export { BingSearchTool as SearchTool };