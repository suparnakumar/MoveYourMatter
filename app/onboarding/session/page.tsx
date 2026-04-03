"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Screen 3: First session (placeholder — real video player in Phase 1b)
export default function FirstSession() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(420); // 7 minutes
  const [done, setDone] = useState(false);

  function startSession() {
    setStarted(true);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((420 - secondsLeft) / 420) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-stone-900 text-white">
      {/* Progress */}
      <div className="h-1 bg-stone-700">
        <div className="h-1 bg-teal-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>

      {/* Video placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {!started ? (
          <>
            <div className="w-24 h-24 rounded-full bg-teal-700 flex items-center justify-center mb-8">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-2">Foundation Rhythm</h1>
            <p className="text-stone-400 mb-2">7 minutes · Track A · Rasa: Veera</p>
            <p className="text-stone-500 text-sm max-w-xs">
              Follow along. Don't think about doing it right. Just move.
            </p>
          </>
        ) : done ? (
          <>
            <div className="text-6xl mb-4">🌟</div>
            <h1 className="text-2xl font-semibold mb-2">You did it</h1>
            <p className="text-stone-400">Let's see what shifted.</p>
          </>
        ) : (
          <>
            <div className="text-7xl font-bold tabular-nums mb-4">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
            <p className="text-stone-400 text-sm">Stay with the rhythm</p>
          </>
        )}
      </div>

      <div className="px-6 pb-12">
        {!started ? (
          <button
            onClick={startSession}
            className="w-full py-4 rounded-2xl bg-teal-600 text-white font-semibold text-lg hover:bg-teal-500 transition-colors"
          >
            Begin session
          </button>
        ) : done ? (
          <button
            onClick={() => router.push("/onboarding/score")}
            className="w-full py-4 rounded-2xl bg-teal-600 text-white font-semibold text-lg hover:bg-teal-500 transition-colors"
          >
            See your Brain Shift Score
          </button>
        ) : (
          <button
            onClick={() => { setDone(true); setStarted(false); }}
            className="w-full py-4 rounded-2xl border border-stone-600 text-stone-400 font-medium hover:border-stone-500 transition-colors"
          >
            Skip to results
          </button>
        )}
      </div>
    </div>
  );
}
