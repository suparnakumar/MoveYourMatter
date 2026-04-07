"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { type CheckIn } from "@/lib/bss";
import type { Rasa } from "@/lib/types";

const SESSION_PHASES = [
  { name: "Opening Namaskar",  duration: 30,  instruction: "Place your hands together. Feel your feet on the ground." },
  { name: "Tabla arrival",     duration: 60,  instruction: "Listen only. Let the beat settle into your body." },
  { name: "Hand tapping",      duration: 60,  instruction: "Tap your hands to the rhythm. Two channels, one beat." },
  { name: "Tatkar footwork",   duration: 75,  instruction: "Step with the beat. Steady, grounded, present." },
  { name: "Doubles",           duration: 60,  instruction: "The beat doubles. Let your body adapt." },
  { name: "Quadruples",        duration: 45,  instruction: "Peak intensity. Stay with it." },
  { name: "Descent",           duration: 45,  instruction: "Slow down. Feel the deceleration." },
  { name: "Closing Namaskar",  duration: 45,  instruction: "Same gesture as the opening. The practice is complete." },
];

export const TOTAL_SESSION_SECONDS = SESSION_PHASES.reduce((s, p) => s + p.duration, 0); // 420 = 7 min
export { SESSION_PHASES };

type SaveParams = {
  pre: CheckIn;
  post: CheckIn;
  bss: number;
  deltas: CheckIn;
  sessionPlanId: string | null;
};

export function usePracticeSession({
  userId,
  rasa,
}: {
  userId: string;
  rasa: Rasa;
}) {
  const supabase = createClient();

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived timer values
  const currentPhaseIndex = (() => {
    let acc = 0;
    for (let i = 0; i < SESSION_PHASES.length; i++) {
      acc += SESSION_PHASES[i].duration;
      if (secondsElapsed < acc) return i;
    }
    return SESSION_PHASES.length - 1;
  })();

  const progress = Math.min(secondsElapsed / TOTAL_SESSION_SECONDS, 1);
  const secondsLeft = Math.max(TOTAL_SESSION_SECONDS - secondsElapsed, 0);
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function startSession() {
    setSessionStarted(true);
    timerRef.current = setInterval(() => {
      setSecondsElapsed((s) => {
        if (s + 1 >= TOTAL_SESSION_SECONDS) {
          clearInterval(timerRef.current!);
          setSessionDone(true);
          return TOTAL_SESSION_SECONDS;
        }
        return s + 1;
      });
    }, 1000);
  }

  function skipToEnd() {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsElapsed(TOTAL_SESSION_SECONDS);
    setSessionDone(true);
  }

  async function save({ pre, post, bss, deltas, sessionPlanId }: SaveParams) {
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];

    await supabase.from("practice_sessions").insert({
      user_id: userId,
      session_date: today,
      session_plan_id: sessionPlanId,
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

    // Streak — only increment once per day
    const { data: existing } = await supabase
      .from("streaks")
      .select("current_streak, longest_streak, last_practice_date")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing?.last_practice_date !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = existing?.last_practice_date === yesterday.toISOString().split("T")[0];
      const newStreak = isConsecutive ? (existing?.current_streak ?? 0) + 1 : 1;

      await supabase.from("streaks").upsert({
        user_id: userId,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, existing?.longest_streak ?? 0),
        last_practice_date: today,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    setSaving(false);
  }

  return {
    secondsElapsed,
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
  };
}
