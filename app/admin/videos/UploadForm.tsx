"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const VIDEO_TYPES = ["continuous", "move", "opening", "closing"];
const RASA_SLUGS = ["veera", "karuna", "shanta", "hasya", "raudra", "bhayanaka", "bibhatsa", "adbhuta"];

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/
  );
  return match?.[1] ?? null;
}

export default function UploadForm() {
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("continuous");
  const [rasaSlug, setRasaSlug] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoId = getYouTubeId(youtubeUrl);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!videoId) { setError("Please enter a valid YouTube URL."); return; }
    if (!title.trim()) { setError("Please enter a title."); return; }

    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: dbError } = await supabase.from("videos").insert({
      title: title.trim(),
      type,
      rasa_slug: rasaSlug || null,
      url: `https://www.youtube.com/embed/${videoId}`,
      storage_path: null,
      duration_seconds: durationSeconds ? parseInt(durationSeconds) : null,
      active: true,
    });

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    setYoutubeUrl("");
    setTitle("");
    setType("continuous");
    setRasaSlug("");
    setDurationSeconds("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-stone-500 mb-1">YouTube URL</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => { setYoutubeUrl(e.target.value); setError(null); }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {videoId && <p className="text-xs text-teal-600 mt-1">✓ Video ID: {videoId}</p>}
        </div>

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

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Duration (seconds)</label>
          <input
            type="number"
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(e.target.value)}
            placeholder="e.g. 420 for 7 min"
            min={1}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {durationSeconds && !isNaN(parseInt(durationSeconds)) && (
            <p className="text-xs text-stone-400 mt-1">
              {Math.floor(parseInt(durationSeconds) / 60)}:{String(parseInt(durationSeconds) % 60).padStart(2, "0")}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {VIDEO_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Rasa (optional)</label>
          <select
            value={rasaSlug}
            onChange={(e) => setRasaSlug(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">— Any rasa —</option>
            {RASA_SLUGS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {videoId && (
        <div className="rounded-xl overflow-hidden max-w-sm" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allowFullScreen
            title="Preview"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-xl">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving || !videoId}
        className="px-6 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving…" : "Add video"}
      </button>
    </form>
  );
}
