/**
 * Tool Metadata
 */
import { z } from 'zod';

/**
 * Tool metadata for documentation and discovery
 */
export interface ToolMetadata {
  name: string;
  description: string;
  parameters: z.ZodObject<z.ZodRawShape>;
  category?: string;
  examples?: Array<{
    input: string;
    output: string;
  }>;
}