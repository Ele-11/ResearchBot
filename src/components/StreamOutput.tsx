"use client";

export type StreamEvent = {
  type: "thinking" | "searching" | "browsing" | "report" | "done" | "error";
  content?: string;
  url?: string;
  stats?: {
    searched: number;
    browsed: number;
    sourcesUsed: number;
  };
};

interface StreamOutputProps {
  events?: StreamEvent[];
}

interface EventItem {
  id: number;
  type: string;
  content: string;
}

export default function StreamOutput({ events = [] }: StreamOutputProps) {
  // Process events into items and currentContent
  const items: EventItem[] = [];
  let currentContent = "";
  let isProcessing = false;
  let doneMessage = "";

  for (const event of events) {
    switch (event.type) {
      case "thinking":
        currentContent += event.content || "";
        break;
      case "searching":
        items.push({
          id: items.length,
          type: "searching",
          content: `🔍 搜索: ${event.content}`,
        });
        break;
      case "browsing":
        items.push({
          id: items.length,
          type: "browsing",
          content: `🌐 浏览: ${event.url}`,
        });
        break;
      case "report":
        currentContent += event.content || "";
        break;
      case "done":
        doneMessage = `✅ 完成！搜索了 ${event.stats?.searched || 0} 个结果`;
        break;
      case "error":
        items.push({
          id: items.length,
          type: "error",
          content: `❌ 错误: ${event.content}`,
        });
        break;
    }
  }

  // Check if processing (has thinking events without done)
  isProcessing = events.length > 0 && !events.some((e) => e.type === "done");

  const hasContent = items.length > 0 || currentContent.length > 0 || isProcessing || doneMessage;

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-gray-50 min-h-[200px]">
      {!hasContent ? (
        <p className="text-gray-400 text-center">研究结果将显示在这里...</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`text-sm ${
                item.type === "error" ? "text-red-600" : "text-gray-700"
              }`}
            >
              {item.content}
            </div>
          ))}
          {currentContent && (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {currentContent}
              {isProcessing && <span className="animate-pulse">▋</span>}
            </div>
          )}
          {isProcessing && !currentContent && (
            <div className="text-sm text-blue-500 animate-pulse">
              处理中...
            </div>
          )}
          {doneMessage && (
            <div className="text-sm text-green-600 font-medium">
              {doneMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}