import { createClient } from "@/lib/supabase/server";
import { currentRasaWeek } from "@/lib/bss";
import PracticePlayer from "./PracticePlayer";
import Link from "next/link";

export default async function PracticePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const rasaWeek = currentRasaWeek();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: rasa }, { data: todaySession }, { data: streak }] =
    await Promise.all([
      supabase.from("rasas").select("*").eq("week_number", rasaWeek).single(),
      supabase.from("practice_sessions")
        .select("brain_shift_score, completed")
        .eq("user_id", user!.id)
        .eq("session_date", today)
        .eq("completed", true)
        .maybeSingle(),
      supabase.from("streaks").select("current_streak").eq("user_id", user!.id).maybeSingle(),
    ]);

  // Load the active session plan for this rasa (needs rasa.slug first)
  const { data: sessionPlan } = await supabase.from("session_plans")
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

  // Extract ordered video URLs from session plan
  const videos = (sessionPlan?.session_plan_clips as PlanClip[] | undefined)
    ?.sort((a, b) => a.position - b.position)
    .map((clip) => clip.videos?.[0] ?? null)
    .filter(Boolean) ?? [];

  return (
    <div className="flex-1 flex flex-col md:items-center md:justify-center md:py-10 md:px-6">
      <div className="w-full md:max-w-2xl flex flex-col flex-1 md:flex-none">
        <PracticePlayer
          userId={user!.id}
          rasa={rasa ?? { slug: "veera", name: "Veera", theme: "Focus, courage", colour: "#0F6E56" }}
          currentStreak={streak?.current_streak ?? 0}
          sessionPlanId={sessionPlan?.id ?? null}
          videos={videos}
        />
      </div>
    </div>
  );
}
