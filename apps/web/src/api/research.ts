/**
 * API Client - Research Service
 */
import type { StreamEvent } from '@/types/stream';

const API_BASE = '/api';

/**
 * Submit a research topic and receive streaming response
 */
export async function* submitResearch(
  topic: string,
  autoSave: boolean = true
): AsyncGenerator<StreamEvent, void, unknown> {
  const response = await fetch(`${API_BASE}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, autoSave }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;

      try {
        const event = JSON.parse(data) as StreamEvent;
        yield event;
      } catch {
        // Skip invalid JSON
      }
    }
  }
}