import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import Greeting from "./Greeting";

function ScoreBand({ score }: { score: number }) {
  if (score >= 80) return <span className="text-teal-600 text-xs font-medium">Strong</span>;
  if (score >= 60) return <span className="text-amber-600 text-xs font-medium">Developing</span>;
  return <span className="text-stone-400 text-xs font-medium">Room to grow</span>;
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] ??
    user?.user_metadata?.name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  const { data: membership } = await supabase
    .from("cohort_members")
    .select("cohort_id, cohorts(name, start_date, whatsapp_link)")
    .eq("user_id", user!.id)
    .maybeSingle();

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let survey: {
    overall_score: number;
    energy_focus_score: number;
    memory_cognition_score: number;
    mood_resilience_score: number;
    sleep_body_score: number;
    member_name: string;
    q10_cognitive_goals: string[] | null;
    submitted_at: string;
  } | null = null;

  if (serviceKey && membership?.cohort_id && user?.email) {
    const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data } = await admin
      .from("brain_health_surveys")
      .select("overall_score, energy_focus_score, memory_cognition_score, mood_resilience_score, sleep_body_score, member_name, q10_cognitive_goals, submitted_at")
      .eq("cohort_id", membership.cohort_id)
      .eq("member_email", user.email.toLowerCase())
      .eq("survey_type", "pre")
      .maybeSingle();

    if (!data) {
      redirect(`/survey/baseline?cohort=${membership.cohort_id}&type=pre&return=/home`);
    }

    survey = data;
  }

  const cohort = membership ? (membership as any).cohorts as {
    name: string;
    start_date: string;
    whatsapp_link: string | null;
  } | null : null;

  const today = new Date().toISOString().split("T")[0];
  let cohortDay: number | null = null;
  let cohortComplete = false;
  if (cohort) {
    const startMs = new Date(cohort.start_date + "T00:00:00").getTime();
    const todayMs = new Date(today + "T00:00:00").getTime();
    const rawDay = Math.floor((todayMs - startMs) / 86400000) + 1;
    if (rawDay >= 1 && rawDay <= 28) cohortDay = rawDay;
    if (rawDay > 28) cohortComplete = true;
  }

  const domains = survey ? [
    { label: "Energy & Focus", score: survey.energy_focus_score },
    { label: "Memory & Cognition", score: survey.memory_cognition_score },
    { label: "Mood & Resilience", score: survey.mood_resilience_score },
    { label: "Sleep & Body", score: survey.sleep_body_score },
  ] : [];

  return (
    <div className="flex-1 px-5 py-7 md:px-10 md:py-10 max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Greeting name={displayName} />
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
          {displayName[0]?.toUpperCase()}
        </div>
      </div>

      {/* Cohort + WhatsApp row */}
      {cohort && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-stone-400">
            {cohort.name}{cohortDay ? ` · Day ${cohortDay} of 28` : ""}
          </p>
          {cohort.whatsapp_link && (
            <a
              href={cohort.whatsapp_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          )}
        </div>
      )}

      {survey ? (
        <>
          {/* Overall score */}
          <div className="bg-teal-700 rounded-2xl p-6 text-white mb-4">
            <p className="text-teal-200 text-xs uppercase tracking-wider mb-2">Your Brain Health Baseline</p>
            <div className="flex items-end gap-3 mb-1">
              <span className="text-6xl font-bold">{survey.overall_score}</span>
              <span className="text-teal-200 mb-2">/&nbsp;100</span>
            </div>
            <p className="text-teal-100 text-sm">
              Taken on {new Date(survey.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {/* Domain scores */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {domains.map(({ label, score }) => (
              <div key={label} className="bg-white rounded-2xl border border-stone-100 px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-stone-400">{label}</p>
                  <ScoreBand score={score} />
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-stone-800">{score}</span>
                  <span className="text-stone-300 text-sm mb-0.5">/100</span>
                </div>
                {/* Mini bar */}
                <div className="mt-2 h-1 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Goals */}
          {survey.q10_cognitive_goals?.length ? (
            <div className="bg-white rounded-2xl border border-stone-100 px-4 py-4 mb-4">
              <p className="text-xs text-stone-400 mb-2">Your goals for this program</p>
              <div className="flex flex-wrap gap-2">
                {survey.q10_cognitive_goals.map((g) => (
                  <span key={g} className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Next step */}
          {cohortComplete ? (
            <Link
              href={`/survey/baseline?cohort=${membership?.cohort_id}&type=post&return=/home`}
              className="flex items-center justify-between w-full bg-teal-700 rounded-2xl px-4 py-4 hover:bg-teal-800 transition-colors"
            >
              <div>
                <p className="text-teal-200 text-xs mb-0.5">The program is complete!</p>
                <p className="font-medium text-white">Take your post-survey to see how far you&apos;ve come</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-300 flex-shrink-0">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          ) : (
            <Link
              href="/videos"
              className="flex items-center justify-between w-full bg-white rounded-2xl border border-stone-100 px-4 py-4 hover:border-teal-200 transition-colors"
            >
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Ready to start?</p>
                <p className="font-medium text-stone-800">Watch the latest video</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600 flex-shrink-0">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          )}
        </>
      ) : membership?.cohort_id ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
          <p className="text-stone-400 text-sm mb-3">Complete your brain health survey to see your baseline.</p>
          <Link
            href={`/survey/baseline?cohort=${membership.cohort_id}&type=pre`}
            className="inline-block px-5 py-2 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors"
          >
            Take the survey
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
          <p className="text-stone-400 text-sm">You&apos;re not enrolled in a cohort yet.</p>
          <p className="text-stone-300 text-xs mt-1">Your brain health baseline will appear here once you&apos;re enrolled.</p>
        </div>
      )}
    </div>
  );
}
