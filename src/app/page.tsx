"use client";

import { useState } from "react";
import ChatInput from "@/components/ChatInput";
import StreamOutput, { StreamEvent } from "@/components/StreamOutput";

export default function Home() {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (topic: string) => {
    setIsProcessing(true);
    setEvents([]);

    try {
      // For now, simulate the research flow with events
      // In full implementation, this would connect to SSE stream
      const simulatedEvents: StreamEvent[] = [
        { type: "thinking", content: "正在分析研究主题..." },
        { type: "searching", content: "搜索相关资料..." },
        { type: "browsing", url: "https://example.com/article1" },
        { type: "browsing", url: "https://example.com/article2" },
        { type: "thinking", content: "正在整理和总结..." },
        { type: "report", content: "# 研究报告\n\n基于搜索结果，关于「" + topic + "」的研究报告内容将在这里显示。\n\n## 主要发现\n\n1. 第一个关键点\n2. 第二个关键点\n3. 第三个关键点" },
        {
          type: "done",
          stats: { searched: 10, browsed: 5, sourcesUsed: 3 },
        },
      ];

      for (const event of simulatedEvents) {
        setEvents((prev) => [...prev, event]);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } catch (error) {
      setEvents([
        {
          type: "error",
          content: `研究失败: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-100">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">🔬 ResearchBot</h1>
      <div className="w-full max-w-3xl space-y-4">
        <ChatInput onSubmit={handleSubmit} disabled={isProcessing} />
        <StreamOutput events={events} />
      </div>
    </main>
  );
}