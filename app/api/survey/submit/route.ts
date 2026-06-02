import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: Request) {
  const {
    cohortId, surveyType, name, email, age,
    q1, q2, q3, q4, q5, q6, q7, q8,
    q9, q10, q11, q12,
    overall, energyFocus, memoryCognition, moodResilience, sleepBody,
  } = await req.json();

  if (!cohortId || !surveyType || !name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const admin = adminClient();
  const normalEmail = email.trim().toLowerCase();

  // Duplicate check
  const { data: existing } = await admin
    .from("brain_health_surveys")
    .select("id")
    .eq("cohort_id", cohortId)
    .eq("member_email", normalEmail)
    .eq("survey_type", surveyType)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Already submitted" }, { status: 409 });
  }

  const { error } = await admin.from("brain_health_surveys").insert({
    cohort_id: cohortId,
    survey_type: surveyType,
    member_name: name.trim(),
    member_email: normalEmail,
    age: age || null,
    q1, q2, q3, q4, q5, q6, q7, q8,
    q9_movement_frequency: q9 || null,
    q10_cognitive_goals: q10 ?? [],
    q11_success_definition: q11 || null,
    q12_biggest_obstacle: q12 || null,
    overall_score: overall,
    energy_focus_score: energyFocus,
    memory_cognition_score: memoryCognition,
    mood_resilience_score: moodResilience,
    sleep_body_score: sleepBody,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // For post surveys, look up pre-survey scores so client can show comparison
  let preScores = null;
  if (surveyType === "post") {
    const { data: pre } = await admin
      .from("brain_health_surveys")
      .select("overall_score, energy_focus_score, memory_cognition_score, mood_resilience_score, sleep_body_score")
      .eq("cohort_id", cohortId)
      .eq("member_email", normalEmail)
      .eq("survey_type", "pre")
      .maybeSingle();

    if (pre) {
      preScores = {
        overall: pre.overall_score,
        energyFocus: pre.energy_focus_score,
        memoryCognition: pre.memory_cognition_score,
        moodResilience: pre.mood_resilience_score,
        sleepBody: pre.sleep_body_score,
      };
    }
  }

  return NextResponse.json({ ok: true, preScores });
}
