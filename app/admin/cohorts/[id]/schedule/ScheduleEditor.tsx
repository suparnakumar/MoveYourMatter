"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Video = { id: string; title: string; type: string; duration_seconds: number | null };
type ScheduleRow = { id?: string; cohort_id: string; day_number: number; video_id: string | null; message: string | null };

const TOTAL_DAYS = 28;

export default function ScheduleEditor({
  cohortId,
  videos,
  initialSchedule,
}: {
  cohortId: string;
  videos: Video[];
  initialSchedule: ScheduleRow[];
}) {
  // Build a map from day_number → row for easy lookup
  const initial = Object.fromEntries(initialSchedule.map((r) => [r.day_number, r]));

  const [rows, setRows] = useState<Record<number, { video_id: string; message: string }>>(() => {
    const out: Record<number, { video_id: string; message: string }> = {};
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      out[d] = {
        video_id: initial[d]?.video_id ?? "",
        message: initial[d]?.message ?? "",
      };
    }
    return out;
  });

  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<number, string>>({});

  function update(day: number, field: "video_id" | "message", value: string) {
    setRows((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
    setSaved((prev) => { const s = new Set(prev); s.delete(day); return s; });
  }

  async function saveDay(day: number) {
    const row = rows[day];
    setSaving(day);
    setErrors((prev) => { const e = { ...prev }; delete e[day]; return e; });

    const supabase = createClient();
    const { error } = await supabase.from("cohort_schedule").upsert({
      cohort_id: cohortId,
      day_number: day,
      video_id: row.video_id || null,
      message: row.message || null,
    }, { onConflict: "cohort_id,day_number" });

    setSaving(null);
    if (error) {
      setErrors((prev) => ({ ...prev, [day]: error.message }));
    } else {
      setSaved((prev) => new Set(prev).add(day));
    }
  }

  // Group days into weeks for display
  const weeks = [1, 2, 3, 4];

  return (
    <div className="space-y-8">
      {weeks.map((week) => (
        <div key={week}>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Week {week}</h2>
          <div className="space-y-2">
            {Array.from({ length: 7 }, (_, i) => (week - 1) * 7 + i + 1).map((day) => (
              <div key={day} className="bg-white rounded-2xl border border-stone-200 px-5 py-4">
                <div className="flex items-start gap-4">
                  {/* Day badge */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-stone-500">D{day}</span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Video selector */}
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">Video</label>
                      <select
                        value={rows[day].video_id}
                        onChange={(e) => update(day, "video_id", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">— No video —</option>
                        {videos.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.title}{v.duration_seconds ? ` (${Math.floor(v.duration_seconds / 60)}:${String(v.duration_seconds % 60).padStart(2, "0")})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">Motivational message</label>
                      <textarea
                        value={rows[day].message}
                        onChange={(e) => update(day, "message", e.target.value)}
                        placeholder="Today you begin…"
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-5">
                    <button
                      onClick={() => saveDay(day)}
                      disabled={saving === day}
                      className="px-4 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 transition-colors disabled:opacity-50"
                    >
                      {saving === day ? "Saving…" : "Save"}
                    </button>
                    {saved.has(day) && <span className="text-xs text-teal-500">Saved ✓</span>}
                    {errors[day] && <span className="text-xs text-rose-500">Error</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
