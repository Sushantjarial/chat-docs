"use client";

import React, { useCallback, useState } from "react";
import FileUploader, { UploadedFile } from "@/components/file-uploader";
import ChatPane, { ChatMessage } from "@/components/chat-pane";
import DarkToggle from "@/components/dark-toggle";
import axios from "axios";

export default function DashboardPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addFiles = useCallback(
    (newFiles: UploadedFile[]) => {
      setFiles((prev) => {
        const merged = [...prev, ...newFiles];
        return merged;
      });
      if (selectedFiles.length === 0 && newFiles.length > 0) {
        setSelectedFiles([newFiles[0]]);
      }
    },
    [selectedFiles]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const userMsg: ChatMessage = {
        id: String(Date.now()),
        role: "user",
        text: text.trim(),
        timestamp: new Date().toISOString(),
      };
       setMessages((m) => [...m, userMsg]);
      const res= await axios.post('/api/query',{query:text})
      console.log("Response from /api/query:", res);

     const ans= res.data.response


      // Mock LLM response: small delay then echo plus optional file context

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        text: `${
          selectedFiles && selectedFiles.length > 0
            ? `[Using ${selectedFiles.map((f) => f.name).join(", ")} as context.] ${ans}`
            : "No files selected."
        }`,
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistantMsg]);
    },
    [selectedFiles]
  );

  return (
    <div className="min-h-screen md:overflow-clip md:max-h-screen dark:bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Chat Docs </h1>
          <DarkToggle />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {/* Left: uploader and file list */}
          <aside className="col-span-1">
            <FileUploader
              files={files}
              onAddFiles={addFiles}
              selectedFiles={selectedFiles}
              onToggleSelect={(f) => {
                setSelectedFiles((prev) => {
                  const exists = prev.some((p) => p.id === f.id);
                  if (exists) return prev.filter((p) => p.id !== f.id);
                  return [...prev, f];
                });
              }}
            />
          </aside>

          {/* Right: chat (spans two columns on md) */}
          <main className="col-span-1 md:col-span-2">
            <ChatPane
              messages={messages}
              onSend={sendMessage}
              selectedFiles={selectedFiles}
              onClear={() => setMessages([])}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
