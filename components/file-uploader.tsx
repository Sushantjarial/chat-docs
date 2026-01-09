"use client";

import React, { useCallback, useRef, useState } from "react";
import axios from "axios";

export type UploadedFile = {
  id: string;
  fileName: string;
  size: number;
  type: string;
  url?: string;
  s3Key?: string;
};

type Props = {
  files: UploadedFile[];
  onAddFiles: (files: UploadedFile[]) => void;
  selectedFiles: UploadedFile[];
  onToggleSelect: (f: UploadedFile) => void;
};

const ACCEPT_EXT = [".pdf", ".txt", ".doc", ".docx"];
const acceptAttr =
  ".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default function FileUploader({
  files,
  onAddFiles,
  selectedFiles,
  onToggleSelect,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [link, setLink] = useState("");

  const addLink = () => {
    if (!link.trim()) return;
    try {
      const u = new URL(link.trim());
      const name = u.hostname + u.pathname;
      const obj: UploadedFile = {
        id:
          typeof crypto !== "undefined" &&
          typeof (crypto as any).randomUUID === "function"
            ? (crypto as any).randomUUID()
            : `${Date.now()}-link`,
        fileName: name,
        size: 0,
        type: "link",
        url: link.trim(),
      };
      onAddFiles([obj]);
      setLink("");

      onToggleSelect(obj);
    } catch (e) {
      console.error("Invalid URL:", link);
    }
  };

  const toUploaded = (
    f: File,
    idx: number
  ): { meta: UploadedFile; file: File } => ({
    meta: {
      id:
        typeof crypto !== "undefined" &&
        typeof (crypto as any).randomUUID === "function"
          ? (crypto as any).randomUUID()
          : `${Date.now()}-${idx}`,
      fileName: f.name,
      size: f.size,
      type: f.type || "application/octet-stream",
    },
    file: f,
  });

  // Returns array of { meta, file }
  const filterAndConvert = (list: FileList | null) => {
    if (!list) return [];
    const arr = Array.from(list).filter((f) => {
      const lower = f.name.toLowerCase();
      return ACCEPT_EXT.some((ext) => lower.endsWith(ext));
    });
    return arr.map(toUploaded);
  };

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      const converted = filterAndConvert(fileList); // [{ meta, file }]
      // if (converted.length + files.length > 8) {
      //   alert("Too many files selected");
      //   return;
      // }
      if (converted.length === 0) return;
      try {
        const res = await axios.post("/api/upload", {
          files: converted.map((f) => ({
            id: f.meta.id,
            fileName: f.meta.fileName,
            type: f.meta.type,
            size: f.meta.size,
          })),
        });
        await Promise.all(
          converted.map(async ({ meta, file }) => {
            const uploaded = res.data.links.find(
              (uf: any) => uf.id === meta.id
            );
            if (uploaded) {
              // Use fetch to upload the actual file
              const putRes = await fetch(uploaded.url, {
                method: "PUT",
                body: file,
                headers: {
                  "Content-Type": meta.type,
                },
              });
              if (putRes.ok) {
                axios.post("/api/complete", {
                  file: meta,
                  s3Key: uploaded.s3Key,
                });
              } else {
                console.error(
                  "File upload failed:",
                  meta.fileName,
                  putRes.status
                );
              }
            }
          })
        );

        onAddFiles(converted.map((f) => f.meta));
      } catch (error) {
        console.error("Upload failed:", error);
      }
    },
    [onAddFiles, files.length]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          borderRadius: "16px",
          padding: "24px 16px",
          textAlign: "center",
          transition: "all 0.3s ease",
          background: dragOver
            ? "rgba(59, 130, 246, 0.15)"
            : "rgba(255, 255, 255, 0.04)",
          border: dragOver
            ? "2px solid rgba(59, 130, 246, 0.5)"
            : "2px dashed rgba(255, 255, 255, 0.15)",
          cursor: "pointer",
        }}
      >
        <div style={{ maxWidth: "280px", margin: "0 auto" }}>
          <div
            style={{
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#f8fafc",
            }}
          >
            Upload documents
          </div>
          <p
            style={{ marginBottom: "12px", fontSize: "12px", color: "#cbd5e1" }}
          >
            PDF, TXT, DOCX — drag & drop or choose files
          </p>

          <div>
            <input
              ref={inputRef}
              type="file"
              accept={acceptAttr}
              multiple
              onChange={onFileChange}
              style={{ display: "none" }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "13px",
                background: "rgba(59, 130, 246, 0.3)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                color: "#93c5fd",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.background =
                  "rgba(59, 130, 246, 0.45)";
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.background =
                  "rgba(59, 130, 246, 0.3)";
              }}
              type="button"
            >
              Choose files
            </button>
          </div>
        </div>
      </div>
      {/* Link input to add external URLs as lightweight files */}
      <div
        style={{
          borderRadius: "16px",
          padding: "16px",
          background: "rgba(255, 255, 255, 0.04)",
          border: "none",
        }}
      >
        <div
          style={{
            marginBottom: "12px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#f8fafc",
          }}
        >
          Add a link
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com/article"
            style={{
              flex: 1,
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              outline: "none",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#f8fafc",
            }}
          />
          <button
            onClick={addLink}
            style={{
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              background: "rgba(59, 130, 246, 0.4)",
              border: "1px solid rgba(59, 130, 246, 0.5)",
              color: "#93c5fd",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.background =
                "rgba(59, 130, 246, 0.55)";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.background =
                "rgba(59, 130, 246, 0.4)";
            }}
            type="button"
          >
            Add
          </button>
        </div>
      </div>

      <div
        style={{
          borderRadius: "16px",
          padding: "16px",
          background: "rgba(255, 255, 255, 0.04)",
          border: "none",
        }}
      >
        <div
          style={{
            marginBottom: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>
            Uploaded files
          </div>
          <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
            {files.length} files
          </div>
        </div>

        {files.length === 0 ? (
          <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
            No files uploaded
          </div>
        ) : (
          <ul
            style={{
              maxHeight: "224px",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {files.map((f) => {
              const isSelected = selectedFiles.some((s) => s.id === f.id);
              return (
                <li
                  key={f.id}
                  onClick={() => onToggleSelect(f)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: isSelected
                      ? "rgba(59, 130, 246, 0.2)"
                      : "transparent",
                    borderLeft: isSelected
                      ? "3px solid rgba(59, 130, 246, 0.6)"
                      : "none",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(59, 130, 246, 0.1)";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      isSelected ? "rgba(59, 130, 246, 0.2)" : "transparent";
                  }}
                >
                  <div
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "13px",
                      color: "#f8fafc",
                    }}
                  >
                    {f.fileName}
                  </div>
                  <div
                    style={{
                      marginLeft: "12px",
                      fontSize: "12px",
                      color: "#cbd5e1",
                      flexShrink: 0,
                    }}
                  >
                    {f.type === "link"
                      ? "link"
                      : `${(f.size / 1024).toFixed(0)} KB`}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
