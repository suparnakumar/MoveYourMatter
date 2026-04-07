"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateBSS, bssLanguage, type CheckIn } from "@/lib/bss";
import VideoPlayer from "./VideoPlayer";

type Phase = "pre" | "session" | "post" | "result";

type Rasa = {
  slug: string;
  name: string;
  theme: string;
  colour: string;
};

type Video = {
  url: string;
  title: string;
  duration_seconds: number;
};

const SESSION_PHASES = [
  { name: "Opening Namaskar", duration: 30, instruction: "Place your hands together. Feel your feet on the ground." },
  { name: "Tabla arrival", duration: 60, instruction: "Listen only. Let the beat settle into your body." },
  { name: "Hand tapping", duration: 60, instruction: "Tap your hands to the rhythm. Two channels, one beat." },
  { name: "Tatkar footwork", duration: 75, instruction: "Step with the beat. Steady, grounded, present." },
  { name: "Doubles", duration: 60, instruction: "The beat doubles. Let your body adapt." },
  { name: "Quadruples", duration: 45, instruction: "Peak intensity. Stay with it." },
  { name: "Descent", duration: 45, instruction: "Slow down. Feel the deceleration." },
  { name: "Closing Namaskar", duration: 45, instruction: "Same gesture as the opening. The practice is complete." },
];
const TOTAL_SECONDS = SESSION_PHASES.reduce((s, p) => s + p.duration, 0); // 420s = 7min

function Slider({ label, description, value, onChange }: {
  label: string; description: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="mb-7">
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-medium text-stone-800">{label}</span>
        <span className="text-2xl font-bold text-teal-700">{value}</span>
      </div>
      <p className="text-stone-400 text-sm mb-3">{description}</p>
      <input type="range" min={1} max={5} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-700 h-2 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-stone-400 mt-1">
        <span>Low</span><span>High</span>
      </div>
    </div>
  );
}

export default function PracticePlayer({
  userId, rasa, currentStreak, sessionPlanId, videos,
}: {
  userId: string;
  rasa: Rasa;
  currentStreak: number;
  sessionPlanId: string | null;
  videos: Video[];
}) {
  const hasVideo = videos.length > 0;
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideo = videos[currentVideoIndex] ?? null;
  const router = useRouter();
  const supabase = createClient();

  const [phase, setPhase] = useState<Phase>("pre");
  const [pre, setPre] = useState<CheckIn>({ focus: 3, energy: 3, calm: 3 });
  const [post, setPost] = useState<CheckIn>({ focus: 3, energy: 3, calm: 3 });
  const [bss, setBss] = useState(0);
  const [deltas, setDeltas] = useState<CheckIn>({ focus: 0, energy: 0, calm: 0 });
  const [saving, setSaving] = useState(false);

  // Session timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derive current phase index from elapsed time
  const currentPhaseIndex = (() => {
    let acc = 0;
    for (let i = 0; i < SESSION_PHASES.length; i++) {
      acc += SESSION_PHASES[i].duration;
      if (secondsElapsed < acc) return i;
    }
    return SESSION_PHASES.length - 1;
  })();

  const progress = Math.min(secondsElapsed / TOTAL_SECONDS, 1);
  const secondsLeft = Math.max(TOTAL_SECONDS - secondsElapsed, 0);
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  function startSession() {
    setSessionStarted(true);
    timerRef.current = setInterval(() => {
      setSecondsElapsed((s) => {
        if (s + 1 >= TOTAL_SECONDS) {
          clearInterval(timerRef.current!);
          setSessionDone(true);
          return TOTAL_SECONDS;
        }
        return s + 1;
      });
    }, 1000);
  }

  function skipToEnd() {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsElapsed(TOTAL_SECONDS);
    setSessionDone(true);
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function handlePostSubmit() {
    const score = calculateBSS(pre, post);
    const d: CheckIn = {
      focus: post.focus - pre.focus,
      energy: post.energy - pre.energy,
      calm: post.calm - pre.calm,
    };
    setBss(score);
    setDeltas(d);
    setPhase("result");
  }

  async function handleSave() {
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];

    // Insert new session (multiple sessions per day allowed)
    await supabase.from("practice_sessions").insert({
      user_id: userId,
      session_date: today,
      rasa_slug: rasa.slug,
      pre_focus: pre.focus,
      pre_energy: pre.energy,
      pre_calm: pre.calm,
      post_focus: post.focus,
      post_energy: post.energy,
      post_calm: post.calm,
      delta_focus: deltas.focus,
      delta_energy: deltas.energy,
      delta_calm: deltas.calm,
      brain_shift_score: bss,
      duration_seconds: secondsElapsed,
      completed: true,
    });

    // Update streak — only increment once per day
    const { data: existing } = await supabase
      .from("streaks")
      .select("current_streak, longest_streak, last_practice_date")
      .eq("user_id", userId)
      .maybeSingle();

    const alreadyPracticedToday = existing?.last_practice_date === today;

    if (!alreadyPracticedToday) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const isConsecutive = existing?.last_practice_date === yesterdayStr;
      const newStreak = isConsecutive ? (existing?.current_streak ?? 0) + 1 : 1;
      const newLongest = Math.max(newStreak, existing?.longest_streak ?? 0);

      await supabase.from("streaks").upsert({
        user_id: userId,
        current_streak: newStreak,
        longest_streak: newLongest,
        last_practice_date: today,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    router.push("/home");
  }

  const language = bssLanguage(bss);

  // ── PRE CHECK-IN ──────────────────────────────────────────
  if (phase === "pre") {
    return (
      <div className="flex-1 flex flex-col bg-stone-50">
        <div className="h-1 bg-stone-200"><div className="h-1 bg-teal-600 w-[5%]" /></div>
        <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-1">This week · {rasa.name}</p>
            <p className="text-sm text-stone-500 italic">{rasa.theme}</p>
          </div>
          <p className="text-stone-400 text-sm mb-1">Before we begin</p>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">Notice how you feel</h1>
          <p className="text-stone-500 text-sm mb-8">No right answers — just a snapshot.</p>
          <Slider label="Focus" description="How sharp is your attention right now?" value={pre.focus} onChange={(v) => setPre((s) => ({ ...s, focus: v }))} />
          <Slider label="Energy" description="How mentally energised do you feel?" value={pre.energy} onChange={(v) => setPre((s) => ({ ...s, energy: v }))} />
          <Slider label="Calm" description="How settled and grounded do you feel?" value={pre.calm} onChange={(v) => setPre((s) => ({ ...s, calm: v }))} />
        </div>
        <div className="px-6 pb-10">
          <button onClick={() => setPhase("session")}
            className="w-full py-4 rounded-2xl bg-teal-700 text-white font-semibold text-lg hover:bg-teal-800 transition-colors">
            I&apos;m ready
          </button>
        </div>
      </div>
    );
  }

  // ── SESSION ───────────────────────────────────────────────
  if (phase === "session") {
    const currentP = SESSION_PHASES[currentPhaseIndex];

    // ── VIDEO MODE ──
    if (hasVideo && currentVideo) {
      return (
        <div className="flex-1 flex flex-col bg-stone-900 text-white">
          <div className="h-1 bg-stone-700">
            <div className="h-1 bg-teal-500 transition-all duration-300"
              style={{ width: `${((currentVideoIndex) / videos.length) * 100}%` }} />
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
              <button onClick={() => setSessionStarted(true)}
                className="mt-10 w-full max-w-xs py-4 rounded-2xl bg-teal-600 text-white font-semibold text-lg hover:bg-teal-500 transition-colors">
                Begin session
              </button>
            </div>
          ) : sessionDone ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="text-6xl mb-4">🌟</div>
              <h1 className="text-2xl font-semibold mb-2">Session complete</h1>
              <p className="text-stone-400 mb-10">Let's see what shifted.</p>
              <button onClick={() => setPhase("post")}
                className="w-full max-w-xs py-4 rounded-2xl bg-teal-600 text-white font-semibold text-lg hover:bg-teal-500 transition-colors">
                Post check-in
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <VideoPlayer
                url={currentVideo.url}
                title={`${rasa.name} · ${currentVideo.title}`}
                onProgress={(s) => setSecondsElapsed(s)}
                onEnded={() => {
                  if (currentVideoIndex < videos.length - 1) {
                    setCurrentVideoIndex((i) => i + 1);
                  } else {
                    setSessionDone(true);
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
                <button onClick={skipToEnd}
                  className="w-full py-3 rounded-2xl border border-stone-700 text-stone-400 text-sm hover:border-stone-600 transition-colors">
                  End session early
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── TIMER / PLACEHOLDER MODE (no video yet) ──
    return (
      <div className="flex-1 flex flex-col bg-stone-900 text-white">
        {/* Progress bar */}
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
              <p className="text-stone-400 text-sm max-w-xs">7 minutes. Follow along. Don't think about doing it right — just move.</p>
            </>
          ) : sessionDone ? (
            <>
              <div className="text-6xl mb-4">🌟</div>
              <h1 className="text-2xl font-semibold mb-2">Session complete</h1>
              <p className="text-stone-400">Let's see what shifted.</p>
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

        <div className="px-6 pb-10 space-y-3">
          {!sessionStarted ? (
            <button onClick={startSession}
              className="w-full py-4 rounded-2xl bg-teal-600 text-white font-semibold text-lg hover:bg-teal-500 transition-colors">
              Begin session
            </button>
          ) : sessionDone ? (
            <button onClick={() => setPhase("post")}
              className="w-full py-4 rounded-2xl bg-teal-600 text-white font-semibold text-lg hover:bg-teal-500 transition-colors">
              Post check-in
            </button>
          ) : (
            <button onClick={skipToEnd}
              className="w-full py-4 rounded-2xl border border-stone-700 text-stone-400 font-medium hover:border-stone-600 transition-colors">
              End session early
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── POST CHECK-IN ─────────────────────────────────────────
  if (phase === "post") {
    return (
      <div className="flex-1 flex flex-col bg-stone-50">
        <div className="h-1 bg-stone-200"><div className="h-1 bg-teal-600 w-[85%]" /></div>
        <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
          <p className="text-stone-400 text-sm mb-1">After the session</p>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">How do you feel now?</h1>
          <p className="text-stone-500 text-sm mb-8">Same check-in. Let's see what shifted.</p>
          <Slider label="Focus" description="How sharp is your attention now?" value={post.focus} onChange={(v) => setPost((s) => ({ ...s, focus: v }))} />
          <Slider label="Energy" description="How mentally energised do you feel?" value={post.energy} onChange={(v) => setPost((s) => ({ ...s, energy: v }))} />
          <Slider label="Calm" description="How settled and grounded do you feel?" value={post.calm} onChange={(v) => setPost((s) => ({ ...s, calm: v }))} />
        </div>
        <div className="px-6 pb-10">
          <button onClick={handlePostSubmit}
            className="w-full py-4 rounded-2xl bg-teal-700 text-white font-semibold text-lg hover:bg-teal-800 transition-colors">
            See my score
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT ────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-stone-50">
      <div className="h-1 bg-teal-600" />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-stone-400 text-sm mb-3">Your Brain Shift Score</p>

        {/* Score ring */}
        <div className="relative w-40 h-40 mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#e7e5e4" strokeWidth="8"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="#0F6E56" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(bss / 100) * 276.5} 276.5`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-stone-900">{bss}</span>
            <span className="text-xs text-stone-400 uppercase tracking-wide">/ 100</span>
          </div>
        </div>

        <p className="text-teal-700 font-semibold mb-1">{language.label}</p>
        <p className="text-stone-500 max-w-xs mb-6">{language.message}</p>

        {/* Delta breakdown */}
        <div className="w-full max-w-xs bg-white rounded-2xl p-4 border border-stone-100 mb-2 text-left">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">What shifted</p>
          {(["focus", "energy", "calm"] as const).map((k) => {
            const d = deltas[k];
            return (
              <div key={k} className="flex items-center justify-between py-1.5">
                <span className="text-stone-600 text-sm capitalize">{k}</span>
                <span className={`text-sm font-semibold ${d > 0 ? "text-teal-700" : d < 0 ? "text-rose-500" : "text-stone-400"}`}>
                  {d > 0 ? `+${d}` : d}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-stone-400 text-xs max-w-xs">
          Streak: {currentStreak + 1} days 🔥
        </p>
      </div>

      <div className="px-6 pb-10">
        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-2xl bg-teal-700 text-white font-semibold text-lg hover:bg-teal-800 transition-colors disabled:opacity-50">
          {saving ? "Saving…" : "Done"}
        </button>
      </div>
    </div>
  );
}
