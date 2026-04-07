"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const VIDEO_TYPES = ["continuous", "move", "opening", "closing"];
const RASA_SLUGS = ["veera", "karuna", "shanta", "hasya", "raudra", "bhayanaka", "bibhatsa", "adbhuta"];

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("continuous");
  const [rasaSlug, setRasaSlug] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);

    // Pre-fill title from filename (strip extension)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));

    // Auto-detect duration via hidden video element
    const url = URL.createObjectURL(f);
    const v = hiddenVideoRef.current!;
    v.src = url;
    v.onloadedmetadata = () => {
      setDuration(Math.round(v.duration));
      URL.revokeObjectURL(url);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a video file."); return; }
    if (!title.trim()) { setError("Please enter a title."); return; }

    setUploading(true);
    setError(null);
    setProgress("Uploading to storage…");

    const supabase = createClient();
    const path = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    const { error: storageError } = await supabase.storage
      .from("videos")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (storageError) {
      setError(storageError.message);
      setUploading(false);
      setProgress("");
      return;
    }

    setProgress("Saving metadata…");

    const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(path);

    const { error: dbError } = await supabase.from("videos").insert({
      title: title.trim(),
      type,
      rasa_slug: rasaSlug || null,
      storage_path: path,
      url: publicUrl,
      duration_seconds: duration,
      active: true,
    });

    if (dbError) {
      setError(dbError.message);
      setUploading(false);
      setProgress("");
      return;
    }

    // Reset form
    setFile(null);
    setTitle("");
    setType("continuous");
    setRasaSlug("");
    setDuration(null);
    setProgress("");
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Hidden video element for duration detection */}
      <video ref={hiddenVideoRef} className="hidden" preload="metadata" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File picker */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-stone-500 mb-1">Video file</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
          />
          {duration !== null && (
            <p className="text-xs text-teal-600 mt-1">
              Duration detected: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
            </p>
          )}
        </div>

        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-stone-500 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Week 1 · Day 1 · Tatkar Base"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {VIDEO_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Rasa */}
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Rasa (optional)</label>
          <select
            value={rasaSlug}
            onChange={(e) => setRasaSlug(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">— Any rasa —</option>
            {RASA_SLUGS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-xl">{error}</p>
      )}

      {progress && (
        <p className="text-sm text-teal-600">{progress}</p>
      )}

      <button
        type="submit"
        disabled={uploading || !file}
        className="px-6 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Upload video"}
      </button>
    </form>
  );
}
