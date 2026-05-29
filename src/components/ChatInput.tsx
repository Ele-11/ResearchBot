"use client";

// Placeholder component
// To be implemented in Milestone 3

export default function ChatInput() {
  return (
    <div className="p-4 border rounded">
      <textarea
        placeholder="Enter research topic..."
        className="w-full p-2 border rounded"
        rows={3}
      />
      <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
        Submit
      </button>
    </div>
  );
}