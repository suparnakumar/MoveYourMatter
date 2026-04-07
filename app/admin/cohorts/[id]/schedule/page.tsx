import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import ScheduleEditor from "./ScheduleEditor";

export default async function AdminSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: cohort }, { data: videos }, { data: schedule }] = await Promise.all([
    supabase.from("cohorts").select("id, name, start_date").eq("id", id).single(),
    supabase.from("videos").select("id, title, type, duration_seconds").eq("active", true).order("created_at"),
    supabase.from("cohort_schedule").select("*").eq("cohort_id", id).order("day_number"),
  ]);

  if (!cohort) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Link href={`/admin/cohorts/${id}`} className="text-stone-400 hover:text-stone-600 text-sm transition-colors">
          ← {cohort.name}
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-stone-900 mb-2">Daily schedule</h1>
      <p className="text-stone-400 text-sm mb-6">
        Set the video and motivational message for each day. Members see this on their practice screen.
      </p>
      <ScheduleEditor cohortId={id} videos={videos ?? []} initialSchedule={schedule ?? []} />
    </div>
  );
}
