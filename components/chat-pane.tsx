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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        borderRadius: "20px",
        height: "80vh",
        background: "rgba(255, 255, 255, 0.05)",
        padding: "18px",
        boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
        border: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: "18px", fontWeight: 600, color: "#f8fafc" }}>
            Chat
          </div>
          <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
            {selectedFiles && selectedFiles.length > 0
              ? `Context: ${selectedFiles
                  .map((f) => f.fileName ?? f.name)
                  .join(", ")}`
              : "No files selected"}
          </div>
        </div>
        <div>
          <button
            onClick={() => onClear?.()}
            type="button"
            title="Clear conversation"
            style={{
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "12px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e2e8f0",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: "auto",
          borderRadius: "14px",
          padding: "12px",
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {messages.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
            No messages yet — ask something about your documents.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  style={{
                    maxWidth: "85%",
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    borderRadius: "12px",
                    padding: "10px 12px",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    color: "#f8fafc",
                    background: isUser
                      ? "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(37,99,235,0.35))"
                      : "rgba(255,255,255,0.06)",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                  }}
                >
                  <div>{m.text}</div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "11px",
                      color: "#cbd5e1",
                    }}
                  >
                    {new Date(m.timestamp || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "4px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message and press Enter"
          style={{
            flex: 1,
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "10px 12px",
            fontSize: "13px",
            outline: "none",
            background: "rgba(255,255,255,0.04)",
            color: "#f8fafc",
          }}
        />
        <button
          onClick={() => void handleSend()}
          disabled={!text.trim()}
          type="button"
          style={{
            borderRadius: "10px",
            padding: "10px 16px",
            fontSize: "13px",
            background: text.trim()
              ? "linear-gradient(135deg, rgba(59,130,246,0.85), rgba(37,99,235,0.95))"
              : "rgba(59,130,246,0.3)",
            border: "1px solid rgba(59,130,246,0.5)",
            color: "#e0f2fe",
            cursor: text.trim() ? "pointer" : "not-allowed",
            opacity: text.trim() ? 1 : 0.65,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
