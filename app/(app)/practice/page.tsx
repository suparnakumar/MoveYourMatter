import { createClient } from "@/lib/supabase/server";
import { currentRasaWeek } from "@/lib/bss";
import PracticePlayer from "./PracticePlayer";
import Link from "next/link";

export default async function PracticePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Load today's rasa
  const rasaWeek = currentRasaWeek();
  const { data: rasa } = await supabase
    .from("rasas")
    .select("*")
    .eq("week_number", rasaWeek)
    .single();

  // Check if user already practiced today
  const today = new Date().toISOString().split("T")[0];
  const { data: todaySession } = await supabase
    .from("practice_sessions")
    .select("brain_shift_score, completed, post_focus, post_energy, post_calm, pre_focus, pre_energy, pre_calm")
    .eq("user_id", user!.id)
    .eq("session_date", today)
    .eq("completed", true)
    .maybeSingle();

  // Load streak
  const { data: streak } = await supabase
    .from("streaks")
    .select("current_streak")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (todaySession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-semibold text-stone-900 mb-2">You practiced today</h1>
        <p className="text-stone-500 mb-2">Brain Shift Score: <strong className="text-teal-700">{todaySession.brain_shift_score}</strong></p>
        <p className="text-stone-400 text-sm mb-8">Streak: {streak?.current_streak ?? 0} days 🔥</p>
        <Link href="/home" className="px-6 py-3 rounded-2xl bg-teal-700 text-white font-medium hover:bg-teal-800 transition-colors">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:items-center md:justify-center md:py-10">
      <div className="w-full md:max-w-lg md:rounded-3xl md:overflow-hidden md:shadow-xl flex flex-col flex-1 md:flex-none md:min-h-[700px]">
        <PracticePlayer
          userId={user!.id}
          rasa={rasa ?? { slug: "veera", name: "Veera", theme: "Focus, courage", colour: "#0F6E56" }}
          currentStreak={streak?.current_streak ?? 0}
        />
      </div>
    </div>
  );
}
