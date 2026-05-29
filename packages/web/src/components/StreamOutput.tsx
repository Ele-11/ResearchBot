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

interface StreamOutputProps {
  events?: StreamEvent[];
  currentText?: string;
}

interface EventItem {
  id: number;
  type: string;
  content: string;
}

export function StreamOutput({ events = [], currentText = '' }: StreamOutputProps) {
  const items: EventItem[] = [];
  let doneMessage = '';
  let doneStats = { searched: 0, browsed: 0, sourcesUsed: 0 };

  for (const event of events) {
    switch (event.type) {
      case 'searching':
        items.push({
          id: items.length,
          type: 'searching',
          content: `🔍 搜索: ${event.content}`,
        });
        break;
      case 'browsing':
        items.push({
          id: items.length,
          type: 'browsing',
          content: `🌐 浏览: ${event.url}`,
        });
        break;
      case 'done':
        doneMessage = '研究完成！';
        doneStats = event.stats || { searched: 0, browsed: 0, sourcesUsed: 0 };
        break;
      case 'error':
        items.push({
          id: items.length,
          type: 'error',
          content: `❌ 错误: ${event.content}`,
        });
        break;
      case 'saved':
        items.push({
          id: items.length,
          type: 'saved',
          content: `📄 已保存: ${event.filename}`,
        });
        break;
      case 'info':
        items.push({
          id: items.length,
          type: 'info',
          content: `ℹ️ ${event.content}`,
        });
        break;
    }
  }

  const isProcessing = events.length > 0 && !events.some((e) => e.type === 'done');
  const savedFile = events.find((e) => e.type === 'saved');
  const displayContent = currentText;
  const hasContent = items.length > 0 || displayContent.length > 0 || isProcessing || doneMessage;

  return (
    <div>
      {!hasContent ? (
        <div style={{
          textAlign: 'center',
          color: 'var(--muted)',
          padding: '40px 0',
          fontSize: 15,
        }}>
          输入研究主题开始分析...
        </div>
      ) : (
        <div>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                fontSize: 14,
                color: item.type === 'error' ? 'var(--red)' : 'var(--ink)',
                marginBottom: 8,
              }}
            >
              {item.content}
            </div>
          ))}

          {isProcessing && (
            <div className="status-thinking" style={{ display: 'inline-block', marginBottom: 12 }}>
              处理中 <span className="animate-pulse-dot" />
            </div>
          )}

          {displayContent && (
            <div
              style={{
                fontSize: 14,
                color: 'var(--ink)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
              }}
            >
              {displayContent}
            </div>
          )}

          {doneMessage && (
            <div style={{
              marginTop: 16,
              padding: 16,
              background: 'rgba(31, 138, 91, 0.06)',
              border: '1px solid rgba(31, 138, 91, 0.2)',
              borderRadius: 8,
            }}>
              <div className="status-done" style={{ display: 'inline-block', marginBottom: 12 }}>
                {doneMessage}
              </div>
              {savedFile && (
                <div style={{ marginTop: 12 }}>
                  <a
                    href={`file://${savedFile.filepath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      background: 'var(--green)',
                      color: 'white',
                      borderRadius: 6,
                      textDecoration: 'none',
                      fontSize: 14,
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
                gap: 10,
                marginTop: 8,
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: 10,
                  background: 'white',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)' }}>
                    {doneStats.searched}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    搜索结果
                  </div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: 10,
                  background: 'white',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)' }}>
                    {doneStats.browsed}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    浏览页面
                  </div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: 10,
                  background: 'white',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)' }}>
                    {doneStats.sourcesUsed}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    引用来源
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StreamOutput;