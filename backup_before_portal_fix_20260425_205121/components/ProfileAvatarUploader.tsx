"use client";

import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";

type Props = {
  currentUrl: string;
  initials: string;
  onUploaded: (url: string) => void;
};

export default function ProfileAvatarUploader({
  currentUrl,
  initials,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(file?: File) {
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Upload failed");
      }

      onUploaded(result.url);
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-5">
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-3xl font-black text-slate-700 dark:bg-white/10 dark:text-white">
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUrl}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-1 right-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
        >
          <Camera className="h-5 w-5" />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading..." : "Upload Photo"}
      </button>
    </div>
  );
}
