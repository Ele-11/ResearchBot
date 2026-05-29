/**
 * Base Tool Class
 */
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Abstract base class for research tools
 */
export abstract class BaseResearchTool extends Tool {
  /**
   * Format a single result - override in subclasses
   */
  protected abstract formatSingleResult(result: unknown): string;

  /**
   * Handle errors consistently
   */
  protected handleError(error: unknown): string {
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return 'An unknown error occurred';
  }

  /**
   * Format results for LLM consumption
   */
  protected formatResults<T>(results: T[]): string {
    if (results.length === 0) {
      return 'No results found.';
    }

    return results
      .map((result, index) => `${index + 1}. ${this.formatSingleResult(result)}`)
      .join('\n\n');
  }
}

/**
 * Zod types re-export
 */
export { z };
export type { ZodObject, ZodRawShape } from 'zod';