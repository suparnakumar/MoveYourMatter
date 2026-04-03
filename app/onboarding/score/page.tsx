"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const dimensions = [
  { key: "focus", label: "Focus", weight: 0.40, description: "How sharp is your attention now?" },
  { key: "energy", label: "Energy", weight: 0.35, description: "How mentally energised do you feel?" },
  { key: "calm", label: "Calm", weight: 0.25, description: "How calm and grounded do you feel?" },
];

function calculateBSS(pre: Record<string, number>, post: Record<string, number>) {
  const weightedDelta = dimensions.reduce((sum, d) => {
    const delta = post[d.key] - pre[d.key]; // -4 to +4
    return sum + delta * d.weight;
  }, 0);
  // Map weighted delta (-4 to +4) to 0–100, with 50 = no change
  return Math.round(50 + (weightedDelta / 4) * 50);
}

function bssLanguage(score: number) {
  if (score >= 75) return { label: "Strong shift", message: "Your mind is firing. This was a high-impact session." };
  if (score >= 60) return { label: "Good shift", message: "Solid session. You moved the needle today." };
  if (score >= 50) return { label: "Mild shift", message: "Small shift — consistency is doing the work." };
  if (score >= 35) return { label: "Flat day", message: "Hard day — showing up anyway is what builds the habit." };
  return { label: "Rough session", message: "Even this session is data. Your brain noticed." };
}

function Slider({ label, description, value, onChange }: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-medium text-stone-800">{label}</span>
        <span className="text-xl font-bold text-teal-700">{value}</span>
      </div>
      <p className="text-stone-400 text-sm mb-2">{description}</p>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-700 h-2 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-stone-400 mt-1">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}

export default function ScorePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"checkin" | "result">("checkin");
  const [post, setPost] = useState({ focus: 3, energy: 3, calm: 3 });
  const [bss, setBss] = useState<number | null>(null);
  const [deltas, setDeltas] = useState<Record<string, number>>({});

  function handleCalculate() {
    const preRaw = sessionStorage.getItem("mym_pre_checkin");
    const pre = preRaw ? JSON.parse(preRaw) : { focus: 3, energy: 3, calm: 3 };
    const score = calculateBSS(pre, post);
    const d: Record<string, number> = {};
    dimensions.forEach((dim) => {
      const k = dim.key as keyof typeof post;
      d[dim.key] = post[k] - pre[k];
    });
    // Save for after sign-up
    sessionStorage.setItem("mym_post_checkin", JSON.stringify(post));
    sessionStorage.setItem("mym_bss", String(score));
    setBss(score);
    setDeltas(d);
    setPhase("result");
  }

  const language = bss !== null ? bssLanguage(bss) : null;

  if (phase === "checkin") {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <div className="h-1 bg-stone-200">
          <div className="h-1 bg-teal-600 w-3/4 transition-all" />
        </div>
        <div className="flex-1 flex flex-col px-6 py-8">
          <p className="text-stone-400 text-sm mb-2">After the session</p>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">How do you feel now?</h1>
          <p className="text-stone-500 text-sm mb-10">Same check-in as before. Let's see what shifted.</p>
          {dimensions.map((d) => (
            <Slider
              key={d.key}
              label={d.label}
              description={d.description}
              value={post[d.key as keyof typeof post]}
              onChange={(v) => setPost((s) => ({ ...s, [d.key]: v }))}
            />
          ))}
        </div>
        <div className="px-6 pb-12">
          <button
            onClick={handleCalculate}
            className="w-full py-4 rounded-2xl bg-teal-700 text-white font-semibold text-lg hover:bg-teal-800 transition-colors"
          >
            See my score
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <div className="h-1 bg-teal-600" />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-stone-400 text-sm mb-2">Your Brain Shift Score</p>

        {/* Score circle */}
        <div className="relative w-40 h-40 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#e7e5e4" strokeWidth="8"/>
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke="#0F6E56"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(bss! / 100) * 276.5} 276.5`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-stone-900">{bss}</span>
            <span className="text-xs text-stone-400 uppercase tracking-wide">/ 100</span>
          </div>
        </div>

        <p className="text-teal-700 font-semibold mb-1">{language?.label}</p>
        <p className="text-stone-600 max-w-xs mb-8">{language?.message}</p>

        {/* Delta breakdown */}
        <div className="w-full max-w-xs bg-white rounded-2xl p-4 border border-stone-100 mb-2">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-3 text-left">What shifted</p>
          {dimensions.map((d) => {
            const delta = deltas[d.key] ?? 0;
            return (
              <div key={d.key} className="flex items-center justify-between py-1">
                <span className="text-stone-600 text-sm">{d.label}</span>
                <span className={`text-sm font-semibold ${delta > 0 ? "text-teal-700" : delta < 0 ? "text-rose-500" : "text-stone-400"}`}>
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-stone-400 text-xs max-w-xs">
          We measure how much your focus, energy and calm shift during practice.
        </p>
      </div>

      <div className="px-6 pb-12">
        <button
          onClick={() => router.push("/onboarding/save")}
          className="w-full py-4 rounded-2xl bg-teal-700 text-white font-semibold text-lg hover:bg-teal-800 transition-colors"
        >
          Save your score and start your streak
        </button>
      </div>
    </div>
  );
}
