import { createClient } from "@/lib/supabase/server";
import { currentRasaWeek } from "@/lib/bss";
import Link from "next/link";
import Greeting from "./Greeting";

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

  const [{ data: streak }, { data: todaySession }, { data: rasa }, { data: recentSessions }, { data: membership }] =
    await Promise.all([
      supabase.from("streaks").select("current_streak, longest_streak").eq("user_id", user!.id).maybeSingle(),
      supabase.from("practice_sessions").select("brain_shift_score, completed").eq("user_id", user!.id).eq("session_date", today).maybeSingle(),
      supabase.from("rasas").select("name, theme, colour, slug").eq("week_number", rasaWeek).single(),
      supabase.from("practice_sessions").select("brain_shift_score, session_date").eq("user_id", user!.id).eq("completed", true).order("session_date", { ascending: false }).limit(7),
      supabase.from("cohort_members")
        .select("cohort_id, cohorts(name, start_date, whatsapp_link)")
        .eq("user_id", user!.id)
        .maybeSingle(),
    ]);

  // Resolve cohort day + today's message
  let cohortDay: number | null = null;
  let cohortName: string | null = null;
  let cohortMessage: string | null = null;
  let whatsappLink: string | null = null;

  if (membership) {
    const cohort = (membership as any).cohorts as {
      name: string;
      start_date: string;
      whatsapp_link: string | null;
    } | null;

    if (cohort) {
      cohortName = cohort.name;
      whatsappLink = cohort.whatsapp_link;
      const startMs = new Date(cohort.start_date + "T00:00:00").getTime();
      const todayMs = new Date(today + "T00:00:00").getTime();
      const day = Math.floor((todayMs - startMs) / 86400000) + 1;
      if (day >= 1 && day <= 28) {
        cohortDay = day;
        const { data: entry } = await supabase
          .from("cohort_schedule")
          .select("message")
          .eq("cohort_id", membership.cohort_id)
          .eq("day_number", day)
          .maybeSingle();
        cohortMessage = entry?.message ?? null;
      }
    }
  }

  const currentStreak = streak?.current_streak ?? 0;
  const sessionDoneToday = todaySession?.completed === true;
  const avgBss = recentSessions?.length
    ? Math.round(recentSessions.reduce((s, r) => s + (r.brain_shift_score ?? 0), 0) / recentSessions.length)
    : null;

  return (
    <div className="flex-1 px-5 py-7 md:px-10 md:py-10 max-w-5xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Greeting name={displayName} />
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
            <Link href="/practice" className="block bg-white rounded-2xl p-5 border border-stone-100 hover:border-teal-200 transition-colors h-[calc(100%-28px)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-xl flex-shrink-0">✅</div>
                <div className="flex-1">
                  <p className="font-medium text-stone-900">Practiced today · BSS {todaySession?.brain_shift_score}</p>
                  <p className="text-teal-600 text-sm">Practice again →</p>
                </div>
              </div>
            </Link>
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

        {/* Cohort card */}
        {cohortDay !== null && (
          <div className="rounded-2xl p-5 border border-teal-100 bg-teal-50 md:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-teal-600 uppercase tracking-wider font-medium mb-1">
                  {cohortName} · Day {cohortDay} of 28
                </p>
                {cohortMessage && (
                  <p className="text-stone-700 text-sm italic mt-1">&ldquo;{cohortMessage}&rdquo;</p>
                )}
              </div>
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp group
                </a>
              )}
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
