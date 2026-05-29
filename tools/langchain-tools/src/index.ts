/**
 * LangChain Tools Package
 *
 * Usage:
 * ```typescript
 * import { createSearchTool, ToolRegistry } from '@researchbot/langchain-tools';
 *
 * // Direct usage
 * const tool = createSearchTool();
 * const result = await tool.invoke('your search query');
 *
 * // With registry
 * const registry = new ToolRegistry();
 * registry.register(createSearchTool(), { name: 'bing_search', description: '...', parameters: ... });
 * const tools = registry.getAll();
 * ```
 */

// Base
export { BaseResearchTool } from './base/index.js';
export type { ToolMetadata } from './base/types.js';
export { z } from './base/index.js';

// Registry
export { ToolRegistry } from './registry/index.js';

// Tools
export { BingSearchTool, createSearchTool, SearchTool } from './tools/index.js';

// Tool metadata
export const TOOL_METADATA = {
  bing_search: {
    name: 'bing_search',
    description: 'Search for web URLs related to a query. Use this when you need to find current information, recent news, or specific URLs on the internet.',
    parameters: z.object({
      query: z.string().optional().describe('The search query'),
    }),
    category: 'search',
    examples: [
      {
        input: 'latest AI research trends 2024',
        output: 'Returns a list of web URLs with titles and snippets',
      },
    ],
  },
};