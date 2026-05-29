/**
 * ChatInput Feature Component
 */
import { useState } from 'react';
import { Input, Button } from '@/components/ui';

interface ChatInputProps {
  onSubmit: (topic: string) => void;
  disabled?: boolean;
}

const MAX_LENGTH = 500;
const MIN_LENGTH = 10;

export function ChatInput({ onSubmit, disabled = false }: ChatInputProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = () => {
    if (disabled) return;
    if (topic.trim().length < MIN_LENGTH) {
      alert(`请输入至少 ${MIN_LENGTH} 个字符的研究主题`);
      return;
    }
    onSubmit(topic.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isValid = topic.trim().length >= MIN_LENGTH && topic.trim().length <= MAX_LENGTH;
  const remaining = MAX_LENGTH - topic.length;
  const needed = MIN_LENGTH - topic.trim().length;

  return (
    <div>
      <Input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入研究主题，例如：深度学习在医学影像诊断中的应用进展"
        rows={4}
        disabled={disabled}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '13px',
            color: remaining < 0 ? 'var(--red)' : 'var(--muted)',
          }}>
            {topic.length}/{MAX_LENGTH}
          </span>
          
          {topic.trim().length > 0 && topic.trim().length < MIN_LENGTH && (
            <span style={{ fontSize: '13px', color: 'var(--amber)' }}>
              还需 {needed} 字符
            </span>
          )}
          
          {topic.trim().length >= MIN_LENGTH && (
            <span style={{ fontSize: '13px', color: 'var(--green)' }}>✓ 可以提交</span>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValid || disabled}
          variant={isValid ? 'primary' : 'secondary'}
        >
          {disabled ? '研究进行中...' : '开始研究'}
        </Button>
      </div>
    </div>
  );
}