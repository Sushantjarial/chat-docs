"use client";

import React, { useCallback, useRef, useState } from "react";
import axios from "axios";

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
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
        name,
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
      name: f.name,
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
      if (converted.length + files.length > 8) {
        alert("Too many files selected");
        return;
      }
      if (converted.length === 0) return;
      try {
        const res = await axios.post("/api/upload", {
          files: converted.map((f) => ({
            id: f.meta.id,
            name: f.meta.name,
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
                console.error("File upload failed:", meta.name, putRes.status);
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
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-md border-2 px-3 py-6 text-center transition ${
          dragOver
            ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/40"
            : "border-dashed border-gray-300 bg-white dark:bg-card"
        }`}
      >
        <div className="mx-auto max-w-xs">
          <div className="mb-2 text-sm font-medium text-foreground">
            Upload documents
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            PDF, TXT, DOCX — drag & drop or choose files
          </p>

          <div>
            <input
              ref={inputRef}
              type="file"
              accept={acceptAttr}
              multiple
              onChange={onFileChange}
              className="hidden"
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-md border px-3 py-1 text-sm"
              type="button"
            >
              Choose files
            </button>
          </div>
        </div>
      </div>
      {/* Link input to add external URLs as lightweight files */}
      <div className="rounded-md border bg-card p-3">
        <div className="mb-2 text-sm font-semibold text-foreground">
          Add a link
        </div>
        <div className="flex gap-2">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com/article"
            className="flex-1 rounded-md border px-3 py-2 text-sm outline-none bg-background text-foreground"
          />
          <button
            onClick={addLink}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white"
            type="button"
          >
            Add
          </button>
        </div>
      </div>

      <div className="rounded-md border bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold text-foreground">
            Uploaded files
          </div>
          <div className="text-xs text-muted-foreground">
            {files.length} files
          </div>
        </div>

        {files.length === 0 ? (
          <div className="text-xs text-muted-foreground">No files uploaded</div>
        ) : (
          <ul className="max-h-56 overflow-auto space-y-1">
            {files.map((f) => {
              const isSelected = selectedFiles.some((s) => s.id === f.id);
              return (
                <li
                  key={f.id}
                  onClick={() => onToggleSelect(f)}
                  className={`flex cursor-pointer items-center justify-between rounded px-3 py-2 transition hover:bg-accent/5 dark:hover:bg-accent/20 ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-800 border-l-4 border-indigo-400"
                      : ""
                  }`}
                >
                  <div className="truncate text-sm text-foreground">
                    {f.name}
                  </div>
                  <div className="ml-3 text-xs text-muted-foreground">
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
