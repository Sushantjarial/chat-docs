"use client";

import React, { useCallback, useEffect, useState } from "react";
import FileUploader, { UploadedFile } from "@/components/file-uploader";
import ChatPane, { ChatMessage } from "@/components/chat-pane";
import DarkToggle from "@/components/dark-toggle";
import axios from "axios";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  maxHeight: "100vh",
  overflow: "hidden",
  background:
    "radial-gradient(circle at 12% 18%, rgba(59, 130, 246, 0.08), transparent 28%), radial-gradient(circle at 82% 12%, rgba(250, 204, 21, 0.07), transparent 30%), linear-gradient(180deg, #0a0a0a 0%, #1a1a1f 45%, #0a0a0a 100%)",
  color: "#f8fafc",
  padding: "32px",
  fontFamily:
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1400px",
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "0px",
  paddingBottom: "16px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  margin: 0,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: "28px",
  alignItems: "stretch",
  flex: 1,
};

const glassCard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.06)",
  boxShadow: "0 30px 90px rgba(0, 0, 0, 0.45)",
  borderRadius: "24px",
  padding: "24px",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "none",
};

const sidebarStyle: React.CSSProperties = {
  ...glassCard,
  position: "sticky",
  top: "16px",
  maxHeight: "calc(100vh - 120px)",
  overflow: "hidden",
};

const mainAreaStyle: React.CSSProperties = {
  ...glassCard,
  minHeight: "100%",
};

export default function DashboardPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/myDocs");
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
      const s3Keys = selectedFiles
        .map((f) => f.s3Key)
        .filter((f) => f !== undefined);
      setMessages((m) => [...m, userMsg]);
      if (s3Keys.length === 0) {
        const assistantMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: "assistant",
          text: "No files selected. Please select files to provide context for your query.",
          timestamp: new Date().toISOString(),
        };
        setMessages((m) => [...m, assistantMsg]);
        return;
      }
      const res = await axios.post("/api/query", { query: text, s3Keys });
      console.log("Response from /api/query:", res);

      const ans = res.data.response;

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        text: `${
          selectedFiles && selectedFiles.length > 0
            ? `[Using ${selectedFiles
                .map((f) => f.fileName)
                .join(", ")} as context.] ${ans}`
            : "No files selected."
        }`,
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistantMsg]);
    },
    [selectedFiles]
  );

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Chat Docs</h1>
          <DarkToggle />
        </div>

        <div style={gridStyle}>
          <div style={sidebarStyle}>
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
          </div>

          <div style={mainAreaStyle}>
            <ChatPane
              messages={messages}
              onSend={sendMessage}
              selectedFiles={selectedFiles}
              onClear={() => setMessages([])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
