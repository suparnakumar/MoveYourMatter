// Brain Shift Score calculation — shared between onboarding and practice player

export const BSS_WEIGHTS = { focus: 0.40, energy: 0.35, calm: 0.25 } as const;

export type CheckIn = { focus: number; energy: number; calm: number };

export function calculateBSS(pre: CheckIn, post: CheckIn): number {
  const weightedDelta =
    (post.focus - pre.focus) * BSS_WEIGHTS.focus +
    (post.energy - pre.energy) * BSS_WEIGHTS.energy +
    (post.calm - pre.calm) * BSS_WEIGHTS.calm;

  // weighted delta ranges -4 to +4; map to 0–100 with 50 = no change
  return Math.round(50 + (weightedDelta / 4) * 50);
}

export function bssLanguage(score: number): { label: string; message: string } {
  if (score >= 75) return { label: "Strong shift", message: "Your mind is firing. This was a high-impact session." };
  if (score >= 60) return { label: "Good shift", message: "Solid session. You moved the needle today." };
  if (score >= 50) return { label: "Mild shift", message: "Small shift — consistency is doing the work." };
  if (score >= 35) return { label: "Flat day", message: "Hard day — showing up anyway is what builds the habit." };
  return { label: "Rough session", message: "Even this session is data. Your brain noticed." };
}

export function currentRasaWeek(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekOfYear = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return ((weekOfYear - 1) % 8) + 1;
}
