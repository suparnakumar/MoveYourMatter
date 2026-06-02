import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

  // Notify admin — fire and forget, don't block the response
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const label = surveyType === "pre" ? "Pre-survey" : "Post-survey";
    resend.emails.send({
      from: "MoveYourMatter <suparna@moveyourmatter.com>",
      to: "suparna@gmail.com",
      subject: `${label} completed — ${name.trim()}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fafaf9;">
          <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #0f766e; margin: 0 0 24px;">MoveYourMatter</p>
          <h2 style="font-size: 20px; font-weight: 600; color: #1c1917; margin: 0 0 16px;">${label} completed</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #44403c;">
            <tr><td style="padding: 6px 0; color: #78716c;">Name</td><td style="padding: 6px 0; font-weight: 500; color: #1c1917;">${name.trim()}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Email</td><td style="padding: 6px 0;">${normalEmail}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Overall</td><td style="padding: 6px 0; font-weight: 600; color: #0f766e;">${overall} / 100</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Energy & Focus</td><td style="padding: 6px 0;">${energyFocus}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Memory & Cognition</td><td style="padding: 6px 0;">${memoryCognition}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Mood & Resilience</td><td style="padding: 6px 0;">${moodResilience}</td></tr>
            <tr><td style="padding: 6px 0; color: #78716c;">Sleep & Body</td><td style="padding: 6px 0;">${sleepBody}</td></tr>
          </table>
          <p style="margin: 24px 0 0;">
            <a href="https://moveyourmatter.com/admin/cohorts/${cohortId}/survey" style="color: #0f766e; font-size: 14px;">View all responses →</a>
          </p>
        </div>
      `,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, preScores });
}
