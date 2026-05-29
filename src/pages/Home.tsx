import { useState, useRef } from 'react';
import ChatInput from '@/components/ChatInput';
import StreamOutput, { StreamEvent } from '@/components/StreamOutput';

export default function Home() {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const textBuffer = useRef('');

  const handleSubmit = async (topic: string) => {
    setIsProcessing(true);
    setEvents([]);
    textBuffer.current = '';
    setCurrentText('');

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, autoSave }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

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
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            
            // 状态消息（thinking 等）
            if (parsed.type && parsed.type !== 'report') {
              setEvents((prev) => [...prev, parsed]);
            }
            
            // 纯文本内容（MiniMax 流式返回）
            if (parsed.text) {
              textBuffer.current += parsed.text;
              setCurrentText(textBuffer.current);
              // 状态更新显示正在生成
              if (!events.some(e => e.type === 'thinking' && e.content === '正在生成研究报告...')) {
                setEvents((prev) => [...prev, { type: 'thinking', content: '正在生成研究报告...' }]);
              }
            }
            
            // 报告内容
            if (parsed.content) {
              textBuffer.current += parsed.content;
              setCurrentText(textBuffer.current);
            }
            
            // 完成
            if (parsed.type === 'done') {
              setEvents((prev) => [...prev, parsed]);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      setEvents([
        {
          type: 'error',
          content: `研究失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '24px 14px 56px' }}>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <div className="eyebrow">AI 论文研究助手</div>
        <h1 style={{
          margin: '18px 0 0',
          maxWidth: 680,
          fontSize: 'clamp(32px, 6vw, 56px)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
        }}>
          ResearchBot
        </h1>
        <p style={{
          margin: '16px 0 0',
          maxWidth: 560,
          color: 'var(--muted)',
          fontSize: 17,
          lineHeight: 1.65,
        }}>
          输入研究主题，AI 自动搜索、浏览和整理论文资料，生成结构化研究报告。
        </p>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        <div className="card" style={{ padding: 20 }}>
          <ChatInput onSubmit={handleSubmit} disabled={isProcessing} autoSave={autoSave} onAutoSaveChange={setAutoSave} />
        </div>

        <div className="card" style={{ padding: 20, minHeight: 280 }}>
          <StreamOutput events={events} currentText={currentText} />
        </div>
      </div>
    </main>
  );
}