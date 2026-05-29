/**
 * Example: How to use the LangChain Search Tool
 * 
 * This demonstrates how to integrate the BingSearchTool into an agent.
 */

import { BingSearchTool, createSearchTool } from './tools/search.js';
import { ToolRegistry } from './registry/index.js';

// ============================================
// Example 1: Simple usage (standalone)
// ============================================

async function simpleExample() {
  const tool = createSearchTool();
  
  // Call the tool directly
  const result = await tool.invoke('AI research trends 2024');
  console.log('Search results:', result);
}

// ============================================
// Example 2: With ToolRegistry (recommended)
// ============================================

async function registryExample() {
  const registry = new ToolRegistry();
  
  // Register the search tool
  const searchTool = createSearchTool();
  registry.register(searchTool, {
    name: 'bing_search',
    description: 'Search for web URLs related to a query. Use this when you need to find current information, recent news, or specific URLs on the internet.',
    parameters: searchTool.argsSchema,
    category: 'search',
    examples: [
      {
        input: 'latest AI research trends 2024',
        output: 'Returns a list of web URLs with titles and snippets',
      },
    ],
  });
  
  // Get all available tools
  const tools = registry.getAll();
  console.log('Available tools:', registry.getToolNames());
  
  // Use a specific tool
  const tool = registry.get('bing_search');
  if (tool) {
    const result = await tool.invoke('deep learning healthcare');
    console.log('Tool result:', result);
  }
}

// ============================================
// Example 3: In a LangChain Agent (concept)
// ============================================

/*
import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithTools } from "langchain/agents";

async function agentExample() {
  const model = new ChatOpenAI({ temperature: 0 });
  const tools = [createSearchTool()];
  
  const executor = await initializeAgentExecutorWithTools({
    llm: model,
    tools,
    verbose: true,
  });
  
  const result = await executor.run(
    "Search for recent papers about transformer architecture"
  );
  
  console.log('Agent result:', result);
}
*/

// Export examples
export { simpleExample, registryExample };

// Run examples (commented out - requires API keys)
// simpleExample();
// registryExample();