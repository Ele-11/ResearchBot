/**
 * Tool Registry
 */
import type { Tool } from '@langchain/core/tools';
import type { ToolMetadata } from '../base/types.js';

/**
 * Registry for managing LangChain tools
 */
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private metadata: Map<string, ToolMetadata> = new Map();

  /**
   * Register a tool with its metadata
   */
  register(tool: Tool, metadata: ToolMetadata): void {
    this.tools.set(metadata.name, tool);
    this.metadata.set(metadata.name, metadata);
  }

  /**
   * Get a tool by name
   */
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get metadata for a tool
   */
  getMetadata(name: string): ToolMetadata | undefined {
    return this.metadata.get(name);
  }

  /**
   * Get all tool names
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    this.tools.clear();
    this.metadata.clear();
  }
}