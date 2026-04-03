"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const goals = [
  { value: "focus", label: "Sharpen my focus", emoji: "🎯" },
  { value: "stress", label: "Less stress, more calm", emoji: "🌊" },
  { value: "energy", label: "More mental energy", emoji: "⚡" },
  { value: "movement", label: "Curious about movement", emoji: "✨" },
];

// Screen 6: One question — shapes which rasa is introduced first
export default function GoalPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  async function handleNext() {
    if (!selected) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        goal: selected,
        display_name: user.user_metadata?.full_name ?? user.email?.split("@")[0],
        avatar_url: user.user_metadata?.avatar_url ?? null,
      });
    }

    router.push("/onboarding/schedule");
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <div className="h-1 bg-stone-200">
        <div className="h-1 bg-teal-600 w-5/6" />
      </div>

      <div className="flex-1 flex flex-col px-6 py-8">
        <p className="text-stone-400 text-sm mb-2">One quick question</p>
        <h1 className="text-2xl font-semibold text-stone-900 mb-8">
          What brings you here?
        </h1>

        <div className="space-y-3">
          {goals.map((g) => (
            <button
              key={g.value}
              onClick={() => setSelected(g.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                selected === g.value
                  ? "border-teal-600 bg-teal-50 text-teal-900"
                  : "border-stone-200 bg-white text-stone-800 hover:border-stone-300"
              }`}
            >
              <span className="text-2xl">{g.emoji}</span>
              <span className="font-medium">{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-12">
        <button
          onClick={handleNext}
          disabled={!selected || saving}
          className="w-full py-4 rounded-2xl bg-teal-700 text-white font-semibold text-lg hover:bg-teal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
