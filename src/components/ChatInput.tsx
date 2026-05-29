import { useState } from 'react';

interface ChatInputProps {
  onSubmit?: (topic: string) => void;
  disabled?: boolean;
  autoSave?: boolean;
  onAutoSaveChange?: (autoSave: boolean) => void;
}

export default function ChatInput({ onSubmit, disabled = false, autoSave = true, onAutoSaveChange }: ChatInputProps) {
  const [topic, setTopic] = useState('');
  const maxLength = 500;
  const minLength = 10;

  const handleSubmit = () => {
    if (disabled) return;
    if (topic.trim().length < minLength) {
      alert(`请输入至少 ${minLength} 个字符的研究主题`);
      return;
    }
    if (topic.trim().length > maxLength) {
      alert(`内容不能超过 ${maxLength} 个字符`);
      return;
    }
    onSubmit?.(topic.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isValid = topic.trim().length >= minLength && topic.trim().length <= maxLength;

  return (
    <div>
      {/* Input area */}
      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入研究主题，例如：深度学习在医学影像诊断中的应用进展"
        className="input-field"
        rows={4}
        disabled={disabled}
      />

      {/* Footer: counter + button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 13,
            color: topic.length > maxLength ? 'var(--red)' : 'var(--muted)',
          }}>
            {topic.length}/{maxLength}
          </span>
          {topic.trim().length > 0 && topic.trim().length < minLength && (
            <span style={{ fontSize: 13, color: 'var(--amber)' }}>
              还需 {minLength - topic.trim().length} 字符
            </span>
          )}
          {topic.trim().length >= minLength && topic.trim().length <= maxLength && (
            <span style={{ fontSize: 13, color: 'var(--green)' }}>✓ 可以提交</span>
          )}
          
          {/* Auto-save toggle */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            marginLeft: 16,
          }}>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => onAutoSaveChange?.(e.target.checked)}
              disabled={disabled}
              style={{ width: 16, height: 16, cursor: disabled ? 'not-allowed' : 'pointer' }}
            />
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>自动保存 MD</span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          className={isValid && !disabled ? 'btn-primary' : 'btn-secondary'}
          style={{ opacity: isValid && !disabled ? 1 : 0.5 }}
        >
          {disabled ? '研究进行中...' : '开始研究'}
        </button>
      </div>
    </div>
  );
}