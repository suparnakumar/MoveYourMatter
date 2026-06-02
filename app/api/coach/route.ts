import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { currentRasaWeek } from "@/lib/bss";
import { buildCoachSystemPrompt, RASA_INSIGHTS } from "@/lib/coach-prompt";

let anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!anthropic) anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { messages } = await req.json();

  const name =
    user.user_metadata?.full_name?.split(" ")[0] ??
    user.user_metadata?.name?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "there";

  // Load cohort membership
  const { data: membership } = await supabase
    .from("cohort_members")
    .select("cohort_id, cohorts(name, start_date)")
    .eq("user_id", user.id)
    .maybeSingle();

  const cohort = membership ? (membership as any).cohorts as { name: string; start_date: string } | null : null;

  let cohortDay: number | null = null;
  if (cohort) {
    const startMs = new Date(cohort.start_date + "T00:00:00").getTime();
    const todayMs = new Date(new Date().toISOString().split("T")[0] + "T00:00:00").getTime();
    const raw = Math.floor((todayMs - startMs) / 86400000) + 1;
    if (raw >= 1 && raw <= 28) cohortDay = raw;
  }

  // Load pre-survey scores via service role (bypasses RLS)
  let surveyScores: { overall: number; energyFocus: number; memoryCognition: number; moodResilience: number; sleepBody: number } | null = null;
  let surveyGoals: string[] | null = null;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && membership?.cohort_id && user.email) {
    const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: survey } = await admin
      .from("brain_health_surveys")
      .select("overall_score, energy_focus_score, memory_cognition_score, mood_resilience_score, sleep_body_score, q10_cognitive_goals")
      .eq("cohort_id", membership.cohort_id)
      .eq("member_email", user.email.toLowerCase())
      .eq("survey_type", "pre")
      .maybeSingle();
    if (survey) {
      surveyScores = {
        overall: survey.overall_score,
        energyFocus: survey.energy_focus_score,
        memoryCognition: survey.memory_cognition_score,
        moodResilience: survey.mood_resilience_score,
        sleepBody: survey.sleep_body_score,
      };
      surveyGoals = survey.q10_cognitive_goals ?? null;
    }
  }

  const systemPrompt = buildCoachSystemPrompt({
    name,
    goal: "brain health",
    streak: 0,
    avgBss: null,
    rasaName: "",
    rasaTheme: "",
    rasaInsight: "",
    cohortName: cohort?.name ?? null,
    cohortDay,
    surveyScores,
    surveyGoals,
  });

  const stream = await getAnthropic().messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages,
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
