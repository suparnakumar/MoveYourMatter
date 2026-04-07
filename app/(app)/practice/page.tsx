import { createClient } from "@/lib/supabase/server";
import { currentRasaWeek } from "@/lib/bss";
import type { Video } from "@/lib/types";
import PracticePlayer from "./PracticePlayer";

export default async function PracticePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const rasaWeek = currentRasaWeek();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: rasa }, { data: streak }, { data: membership }] =
    await Promise.all([
      supabase.from("rasas").select("*").eq("week_number", rasaWeek).single(),
      supabase.from("streaks").select("current_streak").eq("user_id", user!.id).maybeSingle(),
      supabase.from("cohort_members")
        .select("cohort_id, cohorts(start_date, whatsapp_link)")
        .eq("user_id", user!.id)
        .maybeSingle(),
    ]);

  // Resolve cohort schedule for today if user is in a cohort
  let cohortVideo: Video | null = null;
  let motivationalMessage: string | null = null;
  let whatsappLink: string | null = null;

  if (membership) {
    const cohort = (membership as any).cohorts as {
      start_date: string;
      whatsapp_link: string | null;
    } | null;

    if (cohort) {
      whatsappLink = cohort.whatsapp_link;
      const startMs = new Date(cohort.start_date + "T00:00:00").getTime();
      const todayMs = new Date(today + "T00:00:00").getTime();
      const dayNumber = Math.floor((todayMs - startMs) / 86400000) + 1;

      if (dayNumber >= 1 && dayNumber <= 28) {
        const { data: entry } = await supabase
          .from("cohort_schedule")
          .select("message, videos(title, url, duration_seconds)")
          .eq("cohort_id", membership.cohort_id)
          .eq("day_number", dayNumber)
          .maybeSingle();

        const v = (entry as any)?.videos;
        if (v) {
          cohortVideo = v as Video;
          motivationalMessage = (entry as any)?.message ?? null;
        }
      }
    }
  }

  // Fall back to session plan if no cohort video today
  let videos: Video[] = [];
  let sessionPlanId: string | null = null;

  if (!cohortVideo) {
    const { data: sessionPlan } = await supabase
      .from("session_plans")
      .select(`
        id, name, plan_type,
        session_plan_clips (
          position,
          videos ( id, title, url, type, duration_seconds )
        )
      `)
      .eq("rasa_slug", rasa?.slug ?? "veera")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    type ClipVideo = { url: string; title: string; duration_seconds: number };
    type PlanClip = { position: number; videos: ClipVideo[] };

    sessionPlanId = sessionPlan?.id ?? null;
    videos = (sessionPlan?.session_plan_clips as PlanClip[] | undefined)
      ?.sort((a, b) => a.position - b.position)
      .map((clip) => clip.videos?.[0] ?? null)
      .filter(Boolean) ?? [];
  }

  return (
    <div className="flex-1 flex flex-col md:items-center md:justify-center md:py-10 md:px-6">
      <div className="w-full md:max-w-2xl flex flex-col flex-1 md:flex-none">
        <PracticePlayer
          userId={user!.id}
          rasa={rasa ?? { slug: "veera", name: "Veera", theme: "Focus, courage", colour: "#0F6E56" }}
          currentStreak={streak?.current_streak ?? 0}
          sessionPlanId={sessionPlanId}
          videos={cohortVideo ? [cohortVideo] : videos}
          motivationalMessage={motivationalMessage}
          whatsappLink={whatsappLink}
        />
      </div>
    </div>
  );
}
