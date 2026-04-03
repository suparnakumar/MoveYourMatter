import { createClient } from "@/lib/supabase/server";
import { currentRasaWeek } from "@/lib/bss";
import Link from "next/link";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function streakMessage(streak: number) {
  if (streak === 0) return "Start your first session to begin your streak";
  if (streak < 7) return `${7 - streak} more days to your first milestone`;
  if (streak < 21) return `${21 - streak} days to the Rhythm milestone`;
  if (streak < 66) return `${66 - streak} days to Habit Formation`;
  return "You've built a genuine cognitive habit. Keep going.";
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] ??
    user?.user_metadata?.name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  const today = new Date().toISOString().split("T")[0];
  const rasaWeek = currentRasaWeek();

  const [{ data: streak }, { data: todaySession }, { data: rasa }, { data: recentSessions }] =
    await Promise.all([
      supabase.from("streaks").select("current_streak, longest_streak").eq("user_id", user!.id).maybeSingle(),
      supabase.from("practice_sessions").select("brain_shift_score, completed").eq("user_id", user!.id).eq("session_date", today).maybeSingle(),
      supabase.from("rasas").select("name, theme, colour, slug").eq("week_number", rasaWeek).single(),
      supabase.from("practice_sessions").select("brain_shift_score, session_date").eq("user_id", user!.id).eq("completed", true).order("session_date", { ascending: false }).limit(7),
    ]);

  const currentStreak = streak?.current_streak ?? 0;
  const sessionDoneToday = todaySession?.completed === true;
  const avgBss = recentSessions?.length
    ? Math.round(recentSessions.reduce((s, r) => s + (r.brain_shift_score ?? 0), 0) / recentSessions.length)
    : null;

  return (
    <div className="flex-1 px-5 py-7 md:px-10 md:py-10 max-w-5xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-stone-400 text-sm">{timeGreeting()},</p>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 capitalize">{displayName}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
          {displayName[0]?.toUpperCase()}
        </div>
      </div>

      {/* Desktop: two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Streak card */}
        <div className="bg-teal-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-teal-200 text-xs uppercase tracking-wider mb-1">Current streak</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold">{currentStreak}</span>
                <span className="text-teal-200 mb-1 text-sm">days</span>
              </div>
            </div>
            <div className="text-4xl">{currentStreak >= 66 ? "💎" : currentStreak >= 21 ? "🔥" : currentStreak >= 7 ? "⚡" : "🌱"}</div>
          </div>
          <p className="text-teal-200 text-sm mt-2">{streakMessage(currentStreak)}</p>
        </div>

        {/* Today's session */}
        <div>
          <h2 className="text-stone-400 text-xs font-medium uppercase tracking-wider mb-3">Today&apos;s practice</h2>
          {sessionDoneToday ? (
            <div className="bg-white rounded-2xl p-5 border border-stone-100 flex items-center gap-4 h-[calc(100%-28px)]">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-xl flex-shrink-0">✅</div>
              <div className="flex-1">
                <p className="font-medium text-stone-900">Done for today</p>
                <p className="text-stone-400 text-sm">Score: {todaySession?.brain_shift_score} · See you tomorrow</p>
              </div>
            </div>
          ) : (
            <Link href="/practice" className="block bg-white rounded-2xl p-5 border border-stone-100 hover:border-teal-200 transition-colors h-[calc(100%-28px)]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center text-2xl flex-shrink-0">🎵</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900">Foundation Rhythm</h3>
                  <p className="text-stone-400 text-sm">7 min · {rasa?.name ?? "Veera"} · Track A</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Rasa of the week */}
        {rasa && (
          <div className="rounded-2xl p-5 border border-stone-100 bg-white">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">This week&apos;s rasa</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: rasa.colour }} />
              <span className="font-semibold text-stone-900">{rasa.name}</span>
              <span className="text-stone-400 text-sm">{rasa.theme}</span>
            </div>
          </div>
        )}

        {/* Brain Shift Score history */}
        <div>
          <h2 className="text-stone-400 text-xs font-medium uppercase tracking-wider mb-3">Brain Shift Score · 7 days</h2>
          {recentSessions && recentSessions.length > 0 ? (
            <div className="bg-white rounded-2xl p-5 border border-stone-100">
              <div className="flex items-end gap-2 h-16 mb-3">
                {[...recentSessions].reverse().map((s, i) => {
                  const h = Math.max(8, ((s.brain_shift_score ?? 50) / 100) * 64);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full rounded-t-sm" style={{ height: h, backgroundColor: (s.brain_shift_score ?? 50) >= 60 ? "#0F6E56" : "#d6d3d1" }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-stone-400 text-sm">{recentSessions.length} sessions</p>
                {avgBss !== null && (
                  <p className="text-stone-700 text-sm font-medium">Avg <span className="text-teal-700 font-bold">{avgBss}</span></p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 border border-stone-100 text-center">
              <p className="text-stone-400 text-sm">Complete a session to see your score history</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
