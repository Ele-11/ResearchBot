import ChatInput from "@/components/ChatInput";
import StreamOutput from "@/components/StreamOutput";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="mb-8 text-3xl font-bold">ResearchBot</h1>
      <div className="w-full max-w-2xl space-y-4">
        <ChatInput />
        <StreamOutput />
      </div>
    </main>
  );
}