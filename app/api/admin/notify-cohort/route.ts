import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const FROM = "MoveYourMatter <suparna@moveyourmatter.com>";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cohortId } = await req.json();
  if (!cohortId) return NextResponse.json({ error: "cohortId is required" }, { status: 400 });

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!serviceRoleKey || !resendKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Get cohort details
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, name, start_date")
    .eq("id", cohortId)
    .single();
  if (!cohort) return NextResponse.json({ error: "Cohort not found" }, { status: 404 });

  // Calculate today's day number
  const today = new Date().toISOString().split("T")[0];
  const startMs = new Date(cohort.start_date + "T00:00:00").getTime();
  const todayMs = new Date(today + "T00:00:00").getTime();
  const dayNumber = Math.floor((todayMs - startMs) / 86400000) + 1;

  if (dayNumber < 1 || dayNumber > 28) {
    return NextResponse.json({ error: `Today is day ${dayNumber} — outside the 28-day cohort window` }, { status: 400 });
  }

  // Get today's schedule entry
  const { data: entry } = await supabase
    .from("cohort_schedule")
    .select("message, videos(title)")
    .eq("cohort_id", cohortId)
    .eq("day_number", dayNumber)
    .maybeSingle();

  const videoTitle = (entry as any)?.videos?.title ?? null;
  const message = entry?.message ?? null;

  // Get all member user IDs
  const { data: memberRows } = await supabase
    .from("cohort_members")
    .select("user_id")
    .eq("cohort_id", cohortId);

  if (!memberRows?.length) {
    return NextResponse.json({ error: "No members in this cohort" }, { status: 400 });
  }

  // Look up member emails via service role
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData } = await admin.auth.admin.listUsers();
  const ids = new Set(memberRows.map((m) => m.user_id));
  const members = (authData?.users ?? [])
    .filter((u) => ids.has(u.id))
    .map((u) => ({ email: u.email!, name: u.user_metadata?.full_name ?? null }))
    .filter((m) => !!m.email);

  if (!members.length) {
    return NextResponse.json({ error: "No member emails found" }, { status: 400 });
  }

  // Send emails
  const resend = new Resend(resendKey);
  const results = await Promise.allSettled(
    members.map((m) => {
      const firstName = m.name?.split(" ")[0] ?? "there";
      return resend.emails.send({
        from: FROM,
        to: m.email,
        subject: `Day ${dayNumber} — your practice is ready`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fafaf9;">
            <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #0f766e; margin: 0 0 32px;">MoveYourMatter</p>

            <h1 style="font-size: 24px; font-weight: 600; color: #1c1917; margin: 0 0 12px;">Day ${dayNumber}, ${firstName}.</h1>

            ${message ? `<p style="font-size: 15px; color: #78716c; margin: 0 0 24px; line-height: 1.6; font-style: italic;">"${message}"</p>` : ""}

            ${videoTitle ? `<p style="font-size: 14px; color: #78716c; margin: 0 0 24px;">Today's practice: <strong style="color: #1c1917;">${videoTitle}</strong></p>` : ""}

            <a href="https://moveyourmatter.com/practice" style="display: inline-block; background: #0f766e; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; padding: 14px 28px; border-radius: 100px;">
              Start today's practice →
            </a>

            <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 32px 0;" />
            <p style="font-size: 12px; color: #a8a29e; margin: 0;">Your brain is a muscle. Movement is the gym.</p>
          </div>
        `,
      });
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({ sent, failed });
}
