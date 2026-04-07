"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CheckinSlider from "@/components/CheckinSlider";
import { setPreCheckin } from "@/lib/session-store";

const dimensions = [
  { key: "focus", label: "Focus", description: "How sharp is your attention right now?" },
  { key: "energy", label: "Energy", description: "How mentally energised do you feel?" },
  { key: "calm", label: "Calm", description: "How settled and grounded do you feel?" },
];

export default function PreCheckin() {
  const router = useRouter();
  const [scores, setScores] = useState({ focus: 3, energy: 3, calm: 3 });

  function handleNext() {
    setPreCheckin(scores);
    router.push("/onboarding/session");
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Progress */}
      <div className="h-1 bg-stone-200">
        <div className="h-1 bg-teal-600 w-1/4 transition-all" />
      </div>

      <div className="flex-1 flex flex-col px-6 py-8">
        <p className="text-stone-400 text-sm mb-2">Before we begin</p>
        <h1 className="text-2xl font-semibold text-stone-900 mb-2">
          Notice how you feel right now
        </h1>
        <p className="text-stone-500 text-sm mb-10">
          Just a quick read of your current state. No right answers.
        </p>

        {dimensions.map((d) => (
          <CheckinSlider
            key={d.key}
            label={d.label}
            description={d.description}
            value={scores[d.key as keyof typeof scores]}
            onChange={(v) => setScores((s) => ({ ...s, [d.key]: v }))}
          />
        ))}
      </div>

      <div className="px-6 pb-12">
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-teal-700 text-white font-semibold text-lg hover:bg-teal-800 transition-colors"
        >
          I'm ready
        </button>
      </div>
    </div>
  );
}
