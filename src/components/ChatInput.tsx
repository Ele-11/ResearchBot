"use client";

import { useState } from "react";

interface ChatInputProps {
  onSubmit?: (topic: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSubmit, disabled = false }: ChatInputProps) {
  const [topic, setTopic] = useState("");
  const maxLength = 500;
  const minLength = 10;

  const handleSubmit = () => {
    if (topic.trim().length < minLength || topic.trim().length > maxLength) {
      return;
    }
    onSubmit?.(topic.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isValid = topic.trim().length >= minLength && topic.trim().length <= maxLength;

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入研究主题，例如：AI大模型在医疗领域的应用进展"
        className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        disabled={disabled}
      />
      <div className="flex justify-between items-center mt-3">
        <span className={`text-sm ${topic.length > maxLength ? "text-red-500" : "text-gray-500"}`}>
          {topic.length}/{maxLength}
        </span>
        <button
          onClick={handleSubmit}
          disabled={disabled || !isValid}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isValid && !disabled
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          开始研究
        </button>
      </div>
    </div>
  );
}