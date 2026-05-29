/**
 * useResearch Hook
 * 
 * Manages research state and streaming.
 */
import { useState, useRef, useCallback } from 'react';
import { submitResearch } from '@/api';
import type { StreamEvent } from '@/types/stream';

interface UseResearchOptions {
  autoSave?: boolean;
}

interface UseResearchReturn {
  events: StreamEvent[];
  currentText: string;
  isProcessing: boolean;
  error: string | null;
  submit: (topic: string) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing research workflow
 */
export function useResearch(options: UseResearchOptions = {}): UseResearchReturn {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textBuffer = useRef('');
  const autoSave = options.autoSave ?? true;

  const submit = useCallback(async (topic: string) => {
    setIsProcessing(true);
    setEvents([]);
    setError(null);
    textBuffer.current = '';
    setCurrentText('');

    try {
      for await (const event of submitResearch(topic, autoSave)) {
        // Handle text streaming
        if (event.text) {
          textBuffer.current += event.text;
          setCurrentText(textBuffer.current);
          
          // Add thinking status if not present
          setEvents((prev) => {
            if (!prev.some(e => e.type === 'thinking' && e.content === '正在生成研究报告...')) {
              return [...prev, { type: 'thinking', content: '正在生成研究报告...' }];
            }
            return prev;
          });
        }
        
        // Handle status events
        if (event.type && event.type !== 'report') {
          setEvents((prev) => [...prev, event]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setEvents([{
        type: 'error',
        content: `研究失败: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [autoSave]);

  const reset = useCallback(() => {
    setEvents([]);
    setCurrentText('');
    setError(null);
    textBuffer.current = '';
  }, []);

  return {
    events,
    currentText,
    isProcessing,
    error,
    submit,
    reset,
  };
}