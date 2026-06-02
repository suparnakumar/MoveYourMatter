"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Rasa, Video } from "@/lib/types";
import { usePracticeSession, SESSION_PHASES } from "@/hooks/usePracticeSession";
import VideoPlayer from "./VideoPlayer";

export default function PracticePlayer({
  userId, rasa, currentStreak, sessionPlanId, videos, motivationalMessage, whatsappLink,
}: {
  userId: string;
  rasa: Rasa;
  currentStreak: number;
  sessionPlanId: string | null;
  videos: Video[];
  motivationalMessage?: string | null;
  whatsappLink?: string | null;
}) {
  const hasVideo = videos.length > 0;
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideo = videos[currentVideoIndex] ?? null;
  const router = useRouter();
  const [done, setDone] = useState(false);

  const {
    sessionStarted,
    sessionDone,
    saving,
    currentPhaseIndex,
    progress,
    mins,
    secs,
    startSession,
    skipToEnd,
    save,
  } = usePracticeSession({ userId, rasa });

  async function handleDone() {
    await save({ sessionPlanId });
    router.push("/home");
  }

  // ── DONE SCREEN ──────────────────────────────────────────
  if (done || sessionDone) {
    return (
      <div className="flex-1 flex flex-col bg-stone-50">
        <div className="h-1 bg-teal-600" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">Well done.</h1>
          <p className="text-stone-500 mb-2">Day {currentStreak + 1} in the books.</p>
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share in the group
            </a>
          )}
        </div>
        <div className="px-6 pb-10">
          <button onClick={handleDone} disabled={saving}
            className="w-full py-4 rounded-2xl bg-teal-700 text-white font-semibold text-lg hover:bg-teal-800 transition-colors disabled:opacity-50">
            {saving ? "Saving…" : "Done"}
          </button>
        </div>
      </div>
    );
  }

  // ── VIDEO MODE ──────────────────────────────────────────
  if (hasVideo && currentVideo) {
    return (
      <div className="flex-1 flex flex-col bg-stone-900 text-white">
        <div className="h-1 bg-stone-700">
          <div className="h-1 bg-teal-500 transition-all duration-300"
            style={{ width: `${(currentVideoIndex / videos.length) * 100}%` }} />
        </div>

        {!sessionStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8 border-2 border-teal-500"
              style={{ backgroundColor: rasa.colour + "33" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">{rasa.name} · {rasa.theme}</p>
            <h1 className="text-2xl font-semibold mb-2">{currentVideo.title}</h1>
            <p className="text-stone-400 text-sm max-w-xs">Follow along. Don't think about doing it right — just move.</p>
            {motivationalMessage && (
              <div className="mt-6 px-4 py-3 bg-teal-900/60 rounded-xl border border-teal-700/40 max-w-xs">
                <p className="text-teal-200 text-sm italic">&ldquo;{motivationalMessage}&rdquo;</p>
              </div>
            )}
            <button onClick={startSession}
              className="mt-8 w-full max-w-xs py-4 rounded-2xl bg-teal-600 text-white font-semibold text-lg hover:bg-teal-500 transition-colors">
              Begin
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <VideoPlayer
              url={currentVideo.url}
              title={`${rasa.name} · ${currentVideo.title}`}
              onEnded={() => {
                if (currentVideoIndex < videos.length - 1) {
                  setCurrentVideoIndex((i) => i + 1);
                } else {
                  setDone(true);
                }
              }}
            />
            {videos.length > 1 && (
              <div className="px-4 py-3 flex items-center gap-2">
                {videos.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i <= currentVideoIndex ? "bg-teal-500" : "bg-stone-700"}`} />
                ))}
              </div>
            )}
            <div className="px-6 pb-6 mt-auto">
              <button onClick={() => setDone(true)}
                className="w-full py-3 rounded-2xl border border-stone-700 text-stone-400 text-sm hover:border-stone-600 transition-colors">
                End session early
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── TIMER MODE (no video assigned yet) ──────────────────
  const currentP = SESSION_PHASES[currentPhaseIndex];
  return (
    <div className="flex-1 flex flex-col bg-stone-900 text-white">
      <div className="h-1 bg-stone-700">
        <div className="h-1 bg-teal-500 transition-all duration-1000" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {!sessionStarted ? (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8 border-2 border-teal-500"
              style={{ backgroundColor: rasa.colour + "33" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">{rasa.name} · {rasa.theme}</p>
            <h1 className="text-2xl font-semibold mb-2">Foundation Rhythm</h1>
            <p className="text-stone-400 text-sm max-w-xs">7 minutes. Follow along. Just move.</p>
          </>
        ) : (
          <>
            <div className="text-6xl font-bold tabular-nums mb-2">
              {mins}:{secs.toString().padStart(2, "0")}
            </div>
            <p className="text-teal-400 text-sm font-medium mb-1">{currentP.name}</p>
            <p className="text-stone-400 text-sm max-w-xs">{currentP.instruction}</p>
            <div className="flex gap-1.5 mt-6">
              {SESSION_PHASES.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i <= currentPhaseIndex ? "bg-teal-500" : "bg-stone-700"}`} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="px-6 pb-10">
        {!sessionStarted ? (
          <button onClick={startSession}
            className="w-full py-4 rounded-2xl bg-teal-600 text-white font-semibold text-lg hover:bg-teal-500 transition-colors">
            Begin
          </button>
        ) : (
          <button onClick={skipToEnd}
            className="w-full py-3 rounded-2xl border border-stone-700 text-stone-400 font-medium hover:border-stone-600 transition-colors">
            End session early
          </button>
        )}
      </div>
    </div>
  );
}
