"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Video = { id: string; title: string; type: string; duration_seconds: number | null };
type ScheduleRow = { cohort_id: string; day_number: number; video_id: string | null; message: string | null; position?: number };

const TOTAL_DAYS = 28;

function fmt(seconds: number | null) {
  if (!seconds) return "";
  return ` (${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")})`;
}

export default function ScheduleEditor({
  cohortId,
  videos,
  initialSchedule,
}: {
  cohortId: string;
  videos: Video[];
  initialSchedule: ScheduleRow[];
}) {
  const [rows, setRows] = useState<Record<number, { video_ids: string[]; message: string }>>(() => {
    const out: Record<number, { video_ids: string[]; message: string }> = {};
    // day 0 = Welcome video
    const welcomeRows = initialSchedule
      .filter((r) => r.day_number === 0 && r.video_id)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    out[0] = {
      video_ids: welcomeRows.map((r) => r.video_id!),
      message: initialSchedule.find((r) => r.day_number === 0)?.message ?? "",
    };
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      const dayRows = initialSchedule
        .filter((r) => r.day_number === d && r.video_id)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      out[d] = {
        video_ids: dayRows.map((r) => r.video_id!),
        message: initialSchedule.find((r) => r.day_number === d)?.message ?? "",
      };
    }
    return out;
  });

  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<number, string>>({});

  function addVideo(day: number, video_id: string) {
    if (!video_id || rows[day].video_ids.includes(video_id)) return;
    setRows((prev) => ({ ...prev, [day]: { ...prev[day], video_ids: [...prev[day].video_ids, video_id] } }));
    setSaved((prev) => { const s = new Set(prev); s.delete(day); return s; });
  }

  function removeVideo(day: number, video_id: string) {
    setRows((prev) => ({ ...prev, [day]: { ...prev[day], video_ids: prev[day].video_ids.filter((id) => id !== video_id) } }));
    setSaved((prev) => { const s = new Set(prev); s.delete(day); return s; });
  }

  function setMessage(day: number, message: string) {
    setRows((prev) => ({ ...prev, [day]: { ...prev[day], message } }));
    setSaved((prev) => { const s = new Set(prev); s.delete(day); return s; });
  }

  async function saveDay(day: number) {
    const row = rows[day];
    setSaving(day);
    setErrors((prev) => { const e = { ...prev }; delete e[day]; return e; });

    const supabase = createClient();

    // Delete all existing entries for this day
    const { error: delError } = await supabase
      .from("cohort_schedule")
      .delete()
      .eq("cohort_id", cohortId)
      .eq("day_number", day);

    if (delError) {
      setErrors((prev) => ({ ...prev, [day]: delError.message }));
      setSaving(null);
      return;
    }

    // Insert new entries
    if (row.video_ids.length > 0) {
      const inserts = row.video_ids.map((video_id, position) => ({
        cohort_id: cohortId,
        day_number: day,
        video_id,
        message: position === 0 ? row.message || null : null,
        position,
      }));
      const { error } = await supabase.from("cohort_schedule").insert(inserts);
      if (error) {
        setErrors((prev) => ({ ...prev, [day]: error.message }));
        setSaving(null);
        return;
      }
    } else if (row.message) {
      // Message with no video
      const { error } = await supabase.from("cohort_schedule").insert({
        cohort_id: cohortId,
        day_number: day,
        video_id: null,
        message: row.message,
        position: 0,
      });
      if (error) {
        setErrors((prev) => ({ ...prev, [day]: error.message }));
        setSaving(null);
        return;
      }
    }

    setSaving(null);
    setSaved((prev) => new Set(prev).add(day));
  }

  const videoMap = Object.fromEntries(videos.map((v) => [v.id, v]));

  function renderDayRow(day: number, badge: string) {
    const row = rows[day];
    const availableVideos = videos.filter((v) => !row.video_ids.includes(v.id));
    return (
      <div key={day} className="bg-white rounded-2xl border border-stone-200 px-5 py-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
            <span className="text-xs font-bold text-stone-500">{badge}</span>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-2">Videos</label>
              {row.video_ids.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {row.video_ids.map((vid_id) => {
                    const v = videoMap[vid_id];
                    return (
                      <div key={vid_id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-sm text-teal-800">
                        <span>{v?.title ?? vid_id}{fmt(v?.duration_seconds ?? null)}</span>
                        <button
                          onClick={() => removeVideo(day, vid_id)}
                          className="text-teal-400 hover:text-rose-500 transition-colors ml-1"
                          title="Remove"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {availableVideos.length > 0 && (
                <select
                  value=""
                  onChange={(e) => addVideo(day, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">+ Add a video…</option>
                  {availableVideos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title}{fmt(v.duration_seconds)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Message</label>
              <textarea
                value={row.message}
                onChange={(e) => setMessage(day, e.target.value)}
                placeholder="Welcome to the cohort…"
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-1">
            <button
              onClick={() => saveDay(day)}
              disabled={saving === day}
              className="px-4 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 transition-colors disabled:opacity-50"
            >
              {saving === day ? "Saving…" : "Save"}
            </button>
            {saved.has(day) && <span className="text-xs text-teal-500">Saved ✓</span>}
            {errors[day] && <span className="text-xs text-rose-500 text-center max-w-16">Error</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome video — always shown first */}
      <div>
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Welcome</h2>
        <div className="space-y-2">
          {renderDayRow(0, "W")}
        </div>
      </div>

      {[1, 2, 3, 4].map((week) => (
        <div key={week}>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Week {week}</h2>
          <div className="space-y-2">
            {Array.from({ length: 7 }, (_, i) => (week - 1) * 7 + i + 1).map((day) =>
              renderDayRow(day, `D${day}`)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
