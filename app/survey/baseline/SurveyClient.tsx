"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "intro" | "energy" | "memory" | "mood" | "sleep" | "goals" | "score";

interface Form {
  name: string;
  email: string;
  age: string;
  q1: number | null; q2: number | null; q3: number | null;
  q4: number | null; q5: number | null;
  q6: number | null; q7: number | null;
  q8: number | null;
  q9: string;
  q10: string[];
  q11: string;
  q12: string;
}

interface Scores {
  overall: number;
  energyFocus: number;
  memoryCognition: number;
  moodResilience: number;
  sleepBody: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeScores(f: Form): Scores {
  return {
    energyFocus: Math.round(((f.q1! + f.q2! + f.q3!) / 3 / 5) * 100),
    memoryCognition: Math.round(((f.q4! + f.q5!) / 2 / 5) * 100),
    moodResilience: Math.round(((f.q6! + f.q7!) / 2 / 5) * 100),
    sleepBody: Math.round((f.q8! / 5) * 100),
    overall: Math.round(
      ((f.q1! + f.q2! + f.q3! + f.q4! + f.q5! + f.q6! + f.q7! + f.q8!) / 8 / 5) * 100
    ),
  };
}

function getBiggestDeltaLabel(after: Scores, before: Scores): string {
  const domains = [
    { label: "focus and energy", delta: after.energyFocus - before.energyFocus },
    { label: "memory and cognition", delta: after.memoryCognition - before.memoryCognition },
    { label: "mood and resilience", delta: after.moodResilience - before.moodResilience },
    { label: "sleep quality", delta: after.sleepBody - before.sleepBody },
  ];
  const best = domains.reduce((a, b) => (a.delta >= b.delta ? a : b));
  if (best.delta <= 0) return "Every domain held steady. Real change takes time to compound.";
  return `Your ${best.label} improved the most.`;
}

const GOALS = [
  "Sharper focus", "Better memory", "More energy", "Emotional resilience",
  "Reduced brain fog", "Stress relief", "Better sleep", "Mood lift",
];

const MOVEMENT_OPTS = ["Rarely or never", "1–2× a week", "3–4× a week", "Daily"];

const SECTION_PROGRESS: Record<Section, number> = {
  intro: 0, energy: 1, memory: 2, mood: 3, sleep: 4, goals: 5, score: 6,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-0.5 bg-stone-200">
      <div
        className="h-0.5 bg-teal-600 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold tracking-widest uppercase text-teal-700 mb-6">
      {children}
    </p>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-stone-400 text-sm hover:text-stone-600 mb-8"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}

function ContinueBtn({ canProceed, onClick }: { canProceed: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!canProceed}
      className="w-full py-4 rounded-2xl bg-teal-700 text-white font-semibold text-base hover:bg-teal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Continue →
    </button>
  );
}

function Scale({
  label, sublabel, low, high, value, onChange,
}: {
  label: string; sublabel?: string; low: string; high: string;
  value: number | null; onChange: (v: number) => void;
}) {
  return (
    <div className="mb-8">
      <p className="text-stone-800 font-medium leading-snug mb-1">{label}</p>
      {sublabel && (
        <p className="text-stone-400 text-sm leading-relaxed mb-3">{sublabel}</p>
      )}
      <div className="grid grid-cols-5 gap-2 mt-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`py-3.5 rounded-xl text-sm font-semibold transition-colors ${
              value === n
                ? "bg-teal-700 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:border-teal-400"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-stone-400">{low}</span>
        <span className="text-xs text-stone-400">{high}</span>
      </div>
    </div>
  );
}

function DomainBar({
  label, score, prev,
}: {
  label: string; score: number; prev?: number | null;
}) {
  const delta = prev != null ? score - prev : null;
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-stone-600">{label}</span>
        <div className="flex items-center gap-2">
          {prev != null && <span className="text-xs text-stone-400">{prev} →</span>}
          <span className="text-sm font-semibold text-stone-800">{score}</span>
          {delta != null && delta !== 0 && (
            <span className={`text-xs font-semibold ${delta > 0 ? "text-teal-600" : "text-rose-500"}`}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>
      </div>
      <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-2.5 bg-teal-600 rounded-full transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SurveyClient({
  cohortId,
  surveyType,
  userEmail,
  userName,
}: {
  cohortId: string;
  surveyType: "pre" | "post";
  userEmail: string;
  userName: string;
}) {
  const [section, setSection] = useState<Section>("intro");
  const [scienceOpen, setScienceOpen] = useState(false);
  const [form, setForm] = useState<Form>({
    name: userName, email: userEmail, age: "",
    q1: null, q2: null, q3: null,
    q4: null, q5: null,
    q6: null, q7: null,
    q8: null,
    q9: "", q10: [], q11: "", q12: "",
  });
  const [scores, setScores] = useState<Scores | null>(null);
  const [preScores, setPreScores] = useState<Scores | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState(false);

  const set = <K extends keyof Form>(key: K, val: Form[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const pct = Math.round((SECTION_PROGRESS[section] / 6) * 100);

  async function handleSubmit() {
    const computed = computeScores(form);
    setScores(computed);
    setSection("score");

    try {
      const res = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cohortId, surveyType,
          name: form.name, email: form.email, age: form.age,
          q1: form.q1, q2: form.q2, q3: form.q3,
          q4: form.q4, q5: form.q5,
          q6: form.q6, q7: form.q7,
          q8: form.q8,
          q9: form.q9, q10: form.q10, q11: form.q11, q12: form.q12,
          overall: computed.overall,
          energyFocus: computed.energyFocus,
          memoryCognition: computed.memoryCognition,
          moodResilience: computed.moodResilience,
          sleepBody: computed.sleepBody,
        }),
      });

      if (res.status === 409) {
        setDuplicate(true);
      } else if (!res.ok) {
        const d = await res.json();
        setSubmitError(d.error ?? "Could not save your response. Your score is shown above.");
      } else {
        const d = await res.json();
        if (d.preScores) setPreScores(d.preScores);
      }
    } catch {
      setSubmitError("Network error — your score is shown above but may not be saved.");
    }
  }

  // ── Intro ──────────────────────────────────────────────────────────────────

  if (section === "intro") {
    const canProceed = form.name.trim().length > 0;

    return (
      <div className="min-h-screen bg-stone-50">
        <ProgressBar pct={pct} />
        <div className="max-w-lg mx-auto px-6 py-10 pb-24">
          <p className="text-xs font-semibold tracking-widest uppercase text-teal-700 mb-8">
            MoveYourMatter — Brain Health Survey
          </p>

          {/* Hook */}
          <div className="border-l-4 border-teal-600 bg-teal-50 rounded-r-2xl px-5 py-5 mb-6">
            <p className="text-stone-700 text-base leading-relaxed">
              If you&apos;re over 50, this is for you. Memory function declines progressively with age — but the interventions that actually protect it are not the ones most people are doing.
            </p>
            <p className="text-stone-700 text-base leading-relaxed mt-3">
              The brain doesn&apos;t grow from consumption. It grows from production — novel, effortful, skill-based activity. That&apos;s what this practice is designed to be.
            </p>
            <p className="text-stone-700 text-base leading-relaxed mt-3">
              This survey captures where your brain is today. You&apos;ll repeat it at the end of June. We&apos;ll show you exactly what changed.
            </p>
          </div>

          {/* Science panel */}
          <div className="mb-8 rounded-2xl border border-stone-200 bg-white overflow-hidden">
            <button
              onClick={() => setScienceOpen(!scienceOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-stone-700">
                Why movement? The science behind this
              </span>
              <svg
                className={`w-4 h-4 text-stone-400 transition-transform flex-shrink-0 ${scienceOpen ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {scienceOpen && (
              <div className="px-5 pb-5 text-sm text-stone-500 leading-relaxed space-y-3 border-t border-stone-100 pt-4">
                <p>Most adults over 50 reach for puzzles, books, podcasts, and brain training apps to push back against cognitive decline. These are <em>receptive</em> activities — the brain receives. Nothing new is being built. Plasticity needs the friction of unfamiliar effort.</p>
                <p>Denise Park&apos;s lab at UT Dallas tested this directly. They randomized 221 older adults (60–90) across three engagement types for three months. Only one group gained episodic memory — the group that learned a genuinely new productive skill. The receptive group did not improve.</p>
                <p>Three ingredients explain why: <strong className="text-stone-700">Novel</strong> (the skill is genuinely new to you). <strong className="text-stone-700">Effortful</strong> (you have to concentrate to do it). <strong className="text-stone-700">Feedback</strong> (you can tell if you&apos;re improving). Miss one, and the brain doesn&apos;t adapt.</p>
                <p>MoveYourMatter is built on the same mechanism — novel by design, demanding by necessity, feedback-rich from the very first session.</p>
              </div>
            )}
          </div>

          {/* About you */}
          <SectionLabel>About you</SectionLabel>
          <div className="space-y-3 mb-8">
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="email"
              value={form.email}
              readOnly
              className="w-full px-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-400 cursor-default"
            />
            <input
              type="number"
              placeholder="Age (optional)"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              min={18} max={120}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            onClick={() => setSection("energy")}
            disabled={!canProceed}
            className="w-full py-4 rounded-2xl bg-teal-700 text-white font-semibold text-base hover:bg-teal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Begin survey →
          </button>
        </div>
      </div>
    );
  }

  // ── Energy & Focus ────────────────────────────────────────────────────────

  if (section === "energy") {
    return (
      <div className="min-h-screen bg-stone-50">
        <ProgressBar pct={pct} />
        <div className="max-w-lg mx-auto px-6 py-8 pb-24">
          <BackBtn onClick={() => setSection("intro")} />
          <SectionLabel>Energy &amp; Focus</SectionLabel>
          <Scale
            label="How would you rate your mental energy on a typical morning this past week?"
            sublabel="Not physical tiredness — the feeling of mental readiness to think and engage."
            low="Drained" high="Fully charged"
            value={form.q1} onChange={(v) => set("q1", v)}
          />
          <Scale
            label="How easily can you sustain focused attention on a single task for 30+ minutes?"
            sublabel="Without checking your phone, switching tabs, or losing the thread."
            low="Very difficult" high="Very easy"
            value={form.q2} onChange={(v) => set("q2", v)}
          />
          <Scale
            label="How often do you experience brain fog — haziness, slow thinking, or difficulty finding words?"
            low="Most days" high="Rarely"
            value={form.q3} onChange={(v) => set("q3", v)}
          />
          <ContinueBtn
            canProceed={!!(form.q1 && form.q2 && form.q3)}
            onClick={() => setSection("memory")}
          />
        </div>
      </div>
    );
  }

  // ── Memory & Cognition ────────────────────────────────────────────────────

  if (section === "memory") {
    return (
      <div className="min-h-screen bg-stone-50">
        <ProgressBar pct={pct} />
        <div className="max-w-lg mx-auto px-6 py-8 pb-24">
          <BackBtn onClick={() => setSection("energy")} />
          <SectionLabel>Memory &amp; Cognition</SectionLabel>
          <Scale
            label="How confident do you feel in your short-term memory?"
            sublabel="Recalling names, where you put things, tasks you meant to do, recent conversations."
            low="Not confident" high="Very confident"
            value={form.q4} onChange={(v) => set("q4", v)}
          />
          <Scale
            label="When you need to learn or absorb something new, how sharp does your mind feel?"
            low="Slow, effortful" high="Quick, easy"
            value={form.q5} onChange={(v) => set("q5", v)}
          />
          <ContinueBtn
            canProceed={!!(form.q4 && form.q5)}
            onClick={() => setSection("mood")}
          />
        </div>
      </div>
    );
  }

  // ── Mood & Resilience ─────────────────────────────────────────────────────

  if (section === "mood") {
    return (
      <div className="min-h-screen bg-stone-50">
        <ProgressBar pct={pct} />
        <div className="max-w-lg mx-auto px-6 py-8 pb-24">
          <BackBtn onClick={() => setSection("memory")} />
          <SectionLabel>Mood &amp; Resilience</SectionLabel>
          <Scale
            label="How would you describe your baseline mood over the past week?"
            sublabel="Not a single day — the general emotional weather you've been living in."
            low="Low, heavy" high="Light, positive"
            value={form.q6} onChange={(v) => set("q6", v)}
          />
          <Scale
            label="When something stressful or frustrating happens, how quickly does your nervous system settle?"
            low="Hours / not at all" high="Within minutes"
            value={form.q7} onChange={(v) => set("q7", v)}
          />
          <ContinueBtn
            canProceed={!!(form.q6 && form.q7)}
            onClick={() => setSection("sleep")}
          />
        </div>
      </div>
    );
  }

  // ── Sleep & Body ──────────────────────────────────────────────────────────

  if (section === "sleep") {
    return (
      <div className="min-h-screen bg-stone-50">
        <ProgressBar pct={pct} />
        <div className="max-w-lg mx-auto px-6 py-8 pb-24">
          <BackBtn onClick={() => setSection("mood")} />
          <SectionLabel>Sleep &amp; Body</SectionLabel>
          <Scale
            label="How restorative is your sleep most nights?"
            sublabel="Do you wake up feeling recovered, or still tired?"
            low="Not restorative" high="Very restorative"
            value={form.q8} onChange={(v) => set("q8", v)}
          />
          <div className="mb-8">
            <p className="text-stone-800 font-medium leading-snug mb-4">
              How often do you currently engage in intentional physical movement?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MOVEMENT_OPTS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set("q9", opt)}
                  className={`py-3 px-3 rounded-xl text-sm font-medium transition-colors text-center ${
                    form.q9 === opt
                      ? "bg-teal-700 text-white"
                      : "bg-white border border-stone-200 text-stone-600 hover:border-teal-400"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <ContinueBtn
            canProceed={!!form.q8}
            onClick={() => setSection("goals")}
          />
        </div>
      </div>
    );
  }

  // ── Goals ─────────────────────────────────────────────────────────────────

  if (section === "goals") {
    const canSubmit = form.q10.length > 0;
    return (
      <div className="min-h-screen bg-stone-50">
        <ProgressBar pct={pct} />
        <div className="max-w-lg mx-auto px-6 py-8 pb-24">
          <BackBtn onClick={() => setSection("sleep")} />
          <SectionLabel>Your Goals</SectionLabel>

          <div className="mb-8">
            <p className="text-stone-800 font-medium leading-snug mb-1">
              Which cognitive outcomes matter most to you?
            </p>
            <p className="text-stone-400 text-sm mb-4">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => {
                const selected = form.q10.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      set("q10", selected
                        ? form.q10.filter((x) => x !== g)
                        : [...form.q10, g]
                      )
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selected
                        ? "bg-teal-50 border border-teal-500 text-teal-700"
                        : "bg-white border border-stone-200 text-stone-600 hover:border-teal-400"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-stone-800 font-medium leading-snug mb-1">
              What would a successful month look like for your brain?
            </p>
            <p className="text-stone-400 text-sm mb-3">Optional</p>
            <textarea
              value={form.q11}
              onChange={(e) => set("q11", e.target.value)}
              placeholder="e.g. I want to feel less scattered. I want to remember things without writing everything down..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-800 placeholder:text-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="mb-8">
            <p className="text-stone-800 font-medium leading-snug mb-1">
              What is the single biggest obstacle to your cognitive health right now?
            </p>
            <p className="text-stone-400 text-sm mb-3">Optional</p>
            <textarea
              value={form.q12}
              onChange={(e) => set("q12", e.target.value)}
              placeholder="e.g. Poor sleep, constant context-switching, anxiety, no time for myself..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-800 placeholder:text-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4 rounded-2xl bg-teal-700 text-white font-semibold text-base hover:bg-teal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            See my Brain Health Score →
          </button>
        </div>
      </div>
    );
  }

  // ── Score screen ──────────────────────────────────────────────────────────

  if (section === "score" && scores) {
    const isPost = surveyType === "post";
    const delta = isPost && preScores ? scores.overall - preScores.overall : null;

    return (
      <div className="min-h-screen bg-stone-50">
        <div className="h-0.5 bg-teal-600" />
        <div className="max-w-lg mx-auto px-6 py-10 pb-24">
          <p className="text-xs font-semibold tracking-widest uppercase text-teal-700 mb-8">
            MoveYourMatter
          </p>

          {duplicate && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              You&apos;ve already completed this survey. Your original score is shown below.
            </div>
          )}
          {submitError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {submitError}
            </div>
          )}

          {/* Overall score */}
          <div className="text-center mb-10">
            <p className="text-stone-400 text-sm mb-4">Your Brain Health Score</p>
            <div className="relative w-36 h-36 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#e7e5e4" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="44"
                  fill="none" stroke="#0f766e" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(scores.overall / 100) * 276.5} 276.5`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-stone-900">{scores.overall}</span>
                <span className="text-xs text-stone-400 uppercase tracking-wide">/ 100</span>
              </div>
            </div>

            {isPost && delta != null ? (
              <p className={`font-semibold text-lg ${delta > 0 ? "text-teal-700" : delta < 0 ? "text-rose-600" : "text-stone-600"}`}>
                {delta > 0 ? `+${delta}` : delta} points from your baseline
              </p>
            ) : (
              <p className="text-stone-500 text-sm max-w-xs mx-auto mt-2">
                This is your starting point, not a verdict. Every number here has room to move.
              </p>
            )}
          </div>

          {/* Domain breakdown */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-5">
              {isPost && preScores ? "Before → After" : "Domain Breakdown"}
            </p>
            <DomainBar label="Energy & Focus" score={scores.energyFocus} prev={preScores?.energyFocus} />
            <DomainBar label="Memory & Cognition" score={scores.memoryCognition} prev={preScores?.memoryCognition} />
            <DomainBar label="Mood & Resilience" score={scores.moodResilience} prev={preScores?.moodResilience} />
            <DomainBar label="Sleep & Body" score={scores.sleepBody} prev={preScores?.sleepBody} />
          </div>

          {/* Post narrative */}
          {isPost && preScores && (
            <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4 mb-6">
              <p className="text-teal-800 text-sm font-medium">
                {getBiggestDeltaLabel(scores, preScores)}
              </p>
            </div>
          )}

          {/* Saved message */}
          {!isPost && !duplicate && !submitError && (
            <div className="bg-stone-100 rounded-2xl px-5 py-4 mb-6">
              <p className="text-stone-600 text-sm">
                Your score is saved. We&apos;ll send the same survey at the end of June — you&apos;ll see exactly what shifted.
              </p>
            </div>
          )}

          <a
            href="/home"
            className="block w-full py-4 rounded-2xl bg-teal-700 text-white text-center font-semibold text-base hover:bg-teal-800 transition-colors"
          >
            Go to your home page →
          </a>
        </div>
      </div>
    );
  }

  return null;
}
