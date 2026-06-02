export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import VideoLibrary from "./VideoLibrary";

export default async function VideosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date().toISOString().split("T")[0];

  const { data: membership } = await supabase
    .from("cohort_members")
    .select("cohort_id, cohorts(name, start_date)")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!membership) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-stone-400 text-sm">You&apos;re not in a cohort yet.</p>
          <p className="text-stone-300 text-xs mt-1">Videos will appear here once you&apos;re enrolled.</p>
        </div>
      </div>
    );
  }

  const cohort = (membership as any).cohorts as { name: string; start_date: string };
  const startMs = new Date(cohort.start_date + "T00:00:00").getTime();
  const todayMs = new Date(today + "T00:00:00").getTime();
  const currentDay = Math.floor((todayMs - startMs) / 86400000) + 1;

  // Only show videos for days already released
  const { data: entries } = await supabase
    .from("cohort_schedule")
    .select("day_number, message, videos(id, title, url, duration_seconds)")
    .eq("cohort_id", membership.cohort_id)
    .lte("day_number", Math.max(currentDay, 1))
    .order("day_number", { ascending: false });

  return (
    <div className="flex-1 px-5 py-7 md:px-10 md:py-10 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Your Videos</h1>
          <p className="text-stone-400 text-sm mt-0.5">{cohort.name} · Day {currentDay} of 28</p>
        </div>
        <span className="text-xs text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
          {entries?.length ?? 0} released
        </span>
      </div>

      {!entries?.length ? (
        <div className="text-center py-16">
          <p className="text-stone-400 text-sm">No videos released yet — check back on Day 1.</p>
        </div>
      ) : (
        <VideoLibrary entries={entries} />
      )}
    </div>
  );
}
