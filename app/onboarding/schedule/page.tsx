"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const times = [
  { value: "morning", label: "Morning", sub: "6am – 9am", emoji: "🌅" },
  { value: "midday", label: "Midday", sub: "11am – 1pm", emoji: "☀️" },
  { value: "evening", label: "Evening", sub: "5pm – 8pm", emoji: "🌆" },
];

// Screen 7: Commitment — when to practice
export default function SchedulePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  async function handleDone() {
    if (!selected) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        preferred_time: selected,
        onboarding_complete: true,
      });

      // Save the pre/post checkin and BSS to the database
      const preRaw = sessionStorage.getItem("mym_pre_checkin");
      const postRaw = sessionStorage.getItem("mym_post_checkin");
      const bss = sessionStorage.getItem("mym_bss");

      if (preRaw && postRaw && bss) {
        const pre = JSON.parse(preRaw);
        const post = JSON.parse(postRaw);
        await supabase.from("practice_sessions").insert({
          user_id: user.id,
          session_date: new Date().toISOString().split("T")[0],
          pre_focus: pre.focus,
          pre_energy: pre.energy,
          pre_calm: pre.calm,
          post_focus: post.focus,
          post_energy: post.energy,
          post_calm: post.calm,
          brain_shift_score: Number(bss),
          completed: true,
        });

        await supabase.from("streaks").upsert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_practice_date: new Date().toISOString().split("T")[0],
        });
      }
    }

    router.push("/home");
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <div className="h-1 bg-teal-600" />

      <div className="flex-1 flex flex-col px-6 py-8">
        <p className="text-stone-400 text-sm mb-2">Last step</p>
        <h1 className="text-2xl font-semibold text-stone-900 mb-2">
          When works best for you?
        </h1>
        <p className="text-stone-500 text-sm mb-8">
          We'll remind you at this time tomorrow. You can change it anytime.
        </p>

        <div className="space-y-3">
          {times.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelected(t.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                selected === t.value
                  ? "border-teal-600 bg-teal-50 text-teal-900"
                  : "border-stone-200 bg-white text-stone-800 hover:border-stone-300"
              }`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <p className="font-medium">{t.label}</p>
                <p className="text-sm text-stone-400">{t.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-12">
        <button
          onClick={handleDone}
          disabled={!selected || saving}
          className="w-full py-4 rounded-2xl bg-teal-700 text-white font-semibold text-lg hover:bg-teal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Setting up your practice…" : "Start my streak"}
        </button>
      </div>
    </div>
  );
}
