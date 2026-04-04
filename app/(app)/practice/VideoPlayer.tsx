"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const SPEEDS = [0.5, 0.75, 1, 1.25];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({
  url,
  title,
  onEnded,
  onProgress,
}: {
  url: string;
  title?: string;
  onEnded?: () => void;
  onProgress?: (seconds: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  // Auto-hide controls after 3s when playing
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (playing) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current); };
  }, [playing, resetHideTimer]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
    resetHideTimer();
  }

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    onProgress?.(v.currentTime);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
    setCurrentTime(v.currentTime);
    resetHideTimer();
  }

  function setPlaybackSpeed(s: number) {
    const v = videoRef.current;
    if (v) v.playbackRate = s;
    setSpeed(s);
    setSpeedMenuOpen(false);
    resetHideTimer();
  }

  async function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
    resetHideTimer();
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black select-none"
      style={{ aspectRatio: isFullscreen ? undefined : "16/9" }}
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      onClick={() => { if (!speedMenuOpen) togglePlay(); }}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain"
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setPlaying(false); setShowControls(true); onEnded?.(); }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        playsInline
      />

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`} />

      {/* Title */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 px-4 pt-4 pb-2">
          <p className="text-white text-sm font-medium drop-shadow">{title}</p>
        </div>
      )}

      {/* Centre play/pause */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          {playing ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="mb-2 flex items-center gap-2">
          <span className="text-white/70 text-xs tabular-nums w-10">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 accent-teal-400 cursor-pointer"
            style={{ accentColor: "#2dd4bf" }}
          />
          <span className="text-white/70 text-xs tabular-nums w-10 text-right">{formatTime(duration)}</span>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          {/* Play/pause */}
          <button onClick={togglePlay} className="text-white hover:text-teal-300 transition-colors">
            {playing ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <div className="flex items-center gap-4">
            {/* Speed selector */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setSpeedMenuOpen((o) => !o); resetHideTimer(); }}
                className="text-white/80 text-xs font-medium hover:text-white transition-colors px-2 py-1 rounded border border-white/20"
              >
                {speed}x
              </button>
              {speedMenuOpen && (
                <div className="absolute bottom-9 right-0 bg-stone-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={(e) => { e.stopPropagation(); setPlaybackSpeed(s); }}
                      className={`block w-full px-5 py-2.5 text-sm text-left transition-colors ${s === speed ? "text-teal-400 bg-white/5" : "text-white hover:bg-white/10"}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-colors">
              {isFullscreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
