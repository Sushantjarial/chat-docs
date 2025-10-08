"use client";

import React, { useCallback, useEffect, useState } from "react";
import FileUploader, { UploadedFile } from "@/components/file-uploader";
import ChatPane, { ChatMessage } from "@/components/chat-pane";
import DarkToggle from "@/components/dark-toggle";
import axios from "axios";

export default function DashboardPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

useEffect(()=>{
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/myDocs');
      const data = response.data;
      console.log("Fetched data from /api/myDocs:", data);
      if (data && data.docs) {
        const fetchedFiles = data.docs.map((doc: any) => ({
          id: doc.id,
          fileName: doc.fileName,
          size: doc.size,
          type: doc.type,
          s3Key: doc.s3Key,
        }));
        setFiles(fetchedFiles);

      }
    } catch (error) {
      console.error("Error fetching data from /api/myDocs:", error);
    }
  };
  fetchData();
}, []);

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
      const s3Keys=selectedFiles.map(f=>f.s3Key).filter(f=>f!==undefined)
       setMessages((m) => [...m, userMsg]);
       if(s3Keys.length===0){
        const assistantMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: "assistant",
          text: `No files selected. Please select files to provide context for your query.`,
          timestamp: new Date().toISOString(),
        };
        setMessages((m) => [...m, assistantMsg]);
        return;
       }
      const res= await axios.post('/api/query',{query:text, s3Keys: s3Keys })
      console.log("Response from /api/query:", res);

     const ans= res.data.response


      // Mock LLM response: small delay then echo plus optional file context

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        text: `${
          selectedFiles && selectedFiles.length > 0
            ? `[Using ${selectedFiles.map((f) => f.fileName).join(", ")} as context.] ${ans}`
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
