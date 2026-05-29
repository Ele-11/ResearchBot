/**
 * Home Page
 */
import { useResearch } from '@/hooks';
import { ChatInput, StreamOutput, Card } from '@/components';

export function HomePage() {
  const { events, currentText, isProcessing, submit } = useResearch();

  return (
    <main style={{
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '24px 14px 56px',
    }}>
      {/* Header */}
      <header style={{ marginBottom: '28px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--blue)',
        }}>
          AI 论文研究助手
        </div>
        <h1 style={{
          margin: '18px 0 0',
          maxWidth: '680px',
          fontSize: 'clamp(32px, 6vw, 56px)',
          lineHeight: '1.05',
          letterSpacing: '-0.02em',
        }}>
          ResearchBot
        </h1>
        <p style={{
          margin: '16px 0 0',
          maxWidth: '560px',
          color: 'var(--muted)',
          fontSize: '17px',
          lineHeight: '1.65',
        }}>
          输入研究主题，AI 自动搜索、浏览和整理论文资料，生成结构化研究报告。
        </p>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Card padding="20px">
          <ChatInput onSubmit={submit} disabled={isProcessing} />
        </Card>

        <StreamOutput events={events} currentText={currentText} />
      </div>
    </main>
  );
}