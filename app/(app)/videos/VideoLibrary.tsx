"use client";

import { useState } from "react";

interface Video {
  id: string;
  title: string;
  url: string;
  duration_seconds: number | null;
}

interface Entry {
  day_number: number;
  message: string | null;
  videos: Video | Video[] | null;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/youtube\.com\/embed\/([^?&]+)/);
  return match?.[1] ?? null;
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function VideoCard({
  entry,
  video,
  label,
  isLatest,
  expanded,
  onExpand,
  onCollapse,
}: {
  entry: Entry;
  video: Video;
  label: string;
  isLatest: boolean;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}) {
  const videoId = getYouTubeId(video.url);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      {expanded && videoId ? (
        <div>
          <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          </div>
          <div className="px-4 py-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-0.5">{label}</p>
              <p className="font-medium text-stone-800">{video.title}</p>
              {entry.message && (
                <p className="text-stone-400 text-sm italic mt-1">&ldquo;{entry.message}&rdquo;</p>
              )}
            </div>
            <button
              onClick={onCollapse}
              className="text-stone-300 hover:text-stone-500 transition-colors flex-shrink-0 mt-0.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onExpand}
          className="w-full flex items-center gap-4 p-4 text-left hover:bg-stone-50 transition-colors"
        >
          {/* Thumbnail */}
          <div className="relative w-24 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
            {videoId ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                    <svg width="10" height="12" viewBox="0 0 24 24" fill="#0f766e">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d6d3d1" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">{label}</p>
              {isLatest && (
                <span className="px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold">New</span>
              )}
            </div>
            <p className="font-medium text-stone-800 truncate">{video.title}</p>
            {video.duration_seconds && (
              <p className="text-xs text-stone-400 mt-0.5">{formatDuration(video.duration_seconds)}</p>
            )}
          </div>

          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-300 flex-shrink-0">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      )}
    </div>
  );
}

export default function VideoLibrary({ entries }: { entries: Entry[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const welcome = entries.filter((e) => e.day_number === 0);
  const released = entries.filter((e) => e.day_number > 0);
  const latestDay = released.length > 0 ? Math.max(...released.map((e) => e.day_number)) : null;

  function renderEntry(entry: Entry, label: string, isLatest: boolean) {
    const video = Array.isArray(entry.videos) ? entry.videos[0] : entry.videos;
    if (!video) return null;
    return (
      <VideoCard
        key={video.url}
        entry={entry}
        video={video}
        label={label}
        isLatest={isLatest}
        expanded={expanded === video.url}
        onExpand={() => setExpanded(video.url)}
        onCollapse={() => setExpanded(null)}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Welcome video — always pinned at top */}
      {welcome.map((entry) => renderEntry(entry, "Welcome", false))}

      {/* Released cohort videos — newest first */}
      {released.map((entry) =>
        renderEntry(entry, `Day ${entry.day_number}`, entry.day_number === latestDay)
      )}
    </div>
  );
}
