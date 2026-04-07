// Typed sessionStorage helpers for onboarding data flow.
// All reads return null-safe values; all writes are JSON-serialised.

import type { CheckIn } from "./bss";

const KEYS = {
  PRE_CHECKIN: "mym_pre_checkin",
  POST_CHECKIN: "mym_post_checkin",
  BSS: "mym_bss",
} as const;

function safeGet<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function getPreCheckin(): CheckIn | null {
  return safeGet<CheckIn>(KEYS.PRE_CHECKIN);
}

export function setPreCheckin(data: CheckIn): void {
  sessionStorage.setItem(KEYS.PRE_CHECKIN, JSON.stringify(data));
}

export function getPostCheckin(): CheckIn | null {
  return safeGet<CheckIn>(KEYS.POST_CHECKIN);
}

export function setPostCheckin(data: CheckIn): void {
  sessionStorage.setItem(KEYS.POST_CHECKIN, JSON.stringify(data));
}

export function getBss(): number | null {
  const raw = sessionStorage.getItem(KEYS.BSS);
  const n = raw ? Number(raw) : NaN;
  return isNaN(n) ? null : n;
}

export function setBss(score: number): void {
  sessionStorage.setItem(KEYS.BSS, String(score));
}

export function clearOnboardingData(): void {
  Object.values(KEYS).forEach((k) => sessionStorage.removeItem(k));
}
