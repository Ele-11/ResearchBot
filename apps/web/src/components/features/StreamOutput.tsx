/**
 * StreamOutput Feature Component
 */
import type { StreamEvent } from '@/types/stream';
import { Card } from '@/components/ui';

interface StreamOutputProps {
  events: StreamEvent[];
  currentText: string;
}

interface EventItem {
  id: number;
  type: string;
  content: string;
}

export function StreamOutput({ events, currentText }: StreamOutputProps) {
  const items: EventItem[] = [];
  let doneMessage = '';
  let doneStats = { searched: 0, browsed: 0, sourcesUsed: 0 };

  for (const event of events) {
    switch (event.type) {
      case 'searching':
        items.push({ id: items.length, type: 'searching', content: `🔍 搜索: ${event.content}` });
        break;
      case 'browsing':
        items.push({ id: items.length, type: 'browsing', content: `🌐 浏览: ${event.url}` });
        break;
      case 'done':
        doneMessage = '研究完成！';
        doneStats = event.stats || { searched: 0, browsed: 0, sourcesUsed: 0 };
        break;
      case 'error':
        items.push({ id: items.length, type: 'error', content: `❌ 错误: ${event.content}` });
        break;
      case 'saved':
        items.push({ id: items.length, type: 'saved', content: `📄 已保存: ${event.filename}` });
        break;
      case 'info':
        items.push({ id: items.length, type: 'info', content: `ℹ️ ${event.content}` });
        break;
    }
  }

  const isProcessing = events.length > 0 && !events.some((e) => e.type === 'done');
  const savedFile = events.find((e) => e.type === 'saved');
  const hasContent = items.length > 0 || currentText.length > 0 || isProcessing || doneMessage;

  if (!hasContent) {
    return (
      <Card padding="40px">
        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '15px' }}>
          输入研究主题开始分析...
        </div>
      </Card>
    );
  }

  return (
    <Card padding="20px">
      {/* Status items */}
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            fontSize: '14px',
            color: item.type === 'error' ? 'var(--red)' : 'var(--ink)',
            marginBottom: '8px',
          }}
        >
          {item.content}
        </div>
      ))}

      {/* Processing status */}
      {isProcessing && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: 'rgba(59, 130, 246, 0.08)',
          color: 'var(--blue)',
          borderRadius: '6px',
          fontSize: '13px',
          marginBottom: '12px',
        }}>
          处理中 <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            background: 'var(--blue)',
            borderRadius: '50%',
            animation: 'pulse 1.2s infinite',
          }} />
        </div>
      )}

      {/* Report content */}
      {currentText && (
        <div style={{
          fontSize: '14px',
          color: 'var(--ink)',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.7',
        }}>
          {currentText}
        </div>
      )}

      {/* Done state */}
      {doneMessage && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'rgba(31, 138, 91, 0.06)',
          border: '1px solid rgba(31, 138, 91, 0.2)',
          borderRadius: '8px',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: 'rgba(31, 138, 91, 0.08)',
            color: 'var(--green)',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '12px',
          }}>
            {doneMessage}
          </div>
          
          {savedFile && (
            <div style={{ marginTop: '12px' }}>
              <a
                href={`file://${savedFile.filepath}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'var(--green)',
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                📥 下载报告 ({savedFile.filename})
              </a>
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginTop: '8px',
          }}>
            {[
              { value: doneStats.searched, label: '搜索结果' },
              { value: doneStats.browsed, label: '浏览页面' },
              { value: doneStats.sourcesUsed, label: '引用来源' },
            ].map(({ value, label }) => (
              <div key={label} style={{
                textAlign: 'center',
                padding: '10px',
                background: 'white',
                border: '1px solid var(--line)',
                borderRadius: '6px',
              }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--ink)' }}>{value}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}