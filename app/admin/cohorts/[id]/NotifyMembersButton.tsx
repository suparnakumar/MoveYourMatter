"use client";

import { useState } from "react";

export default function NotifyMembersButton({ cohortId }: { cohortId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleNotify() {
    setLoading(true);
    setResult(null);
    setError(null);

    const res = await fetch("/api/admin/notify-cohort", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cohortId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
    } else {
      setResult(data);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleNotify}
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-sm font-medium hover:bg-stone-200 transition-colors disabled:opacity-50"
      >
        {loading ? "Sending…" : "Notify members today"}
      </button>
      {result && (
        <p className="text-sm text-teal-600">
          Sent to {result.sent} member{result.sent !== 1 ? "s" : ""}
          {result.failed > 0 ? `, ${result.failed} failed` : " ✓"}
        </p>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
