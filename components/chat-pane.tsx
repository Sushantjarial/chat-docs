"use client";

import React, { useEffect, useRef, useState } from "react";
import { UploadedFile } from "./file-uploader";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp?: string;
};

type Props = {
  messages: ChatMessage[];
  onSend: (text: string) => Promise<void> | void;
  selectedFiles: UploadedFile[];
  onClear?: () => void;
};

export default function ChatPane({
  messages,
  onSend,
  selectedFiles,
  onClear,
}: Props) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await onSend(text);
    setText("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex  flex-col gap-3 rounded-md border h-[80vh] bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Chat</div>
          <div className="text-xs text-muted-foreground">
            {selectedFiles && selectedFiles.length > 0
              ? `Context: ${selectedFiles.map((f) => f.name).join(", ")}`
              : "No files selected"}
          </div>
        </div>
        <div>
          <button
            onClick={() => onClear?.()}
            className="rounded-md border px-2 py-1 text-xs"
            type="button"
            title="Clear conversation"
          >
            Clear
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto rounded-md border p-3 bg-popover"
      >
        {messages.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No messages yet — ask something about your documents.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "self-end bg-indigo-50 dark:bg-indigo-800"
                    : "self-start bg-gray-100 dark:bg-popover-foreground/5"
                }`}
              >
                <div>{m.text}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {new Date(m.timestamp || Date.now()).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message and press Enter"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-background text-foreground"
        />
        <button
          onClick={() => void handleSend()}
          disabled={!text.trim()}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
          type="button"
        >
          Send
        </button>
      </div>
    </div>
  );
}
