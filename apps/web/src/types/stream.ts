/**
 * Stream Event Types
 */
export type StreamEvent = {
  type?: 'thinking' | 'searching' | 'browsing' | 'report' | 'done' | 'error' | 'saved' | 'info';
  content?: string;
  text?: string;
  url?: string;
  filepath?: string;
  filename?: string;
  stats?: {
    searched: number;
    browsed: number;
    sourcesUsed: number;
  };
};