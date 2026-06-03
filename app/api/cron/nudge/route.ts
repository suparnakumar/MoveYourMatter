import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const admin = adminClient();
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  if (!resend) return new Response("No Resend key", { status: 500 });

  const today = new Date().toISOString().split("T")[0];
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();

  // Get all active cohort members with cohort info
  const { data: members } = await admin
    .from("cohort_members")
    .select("user_id, last_seen_at, cohorts(name, start_date)")
    .or(`last_seen_at.is.null,last_seen_at.lt.${threeDaysAgo}`);

  if (!members?.length) return new Response("No inactive members", { status: 200 });

  // Filter to members whose cohort is still running (day 1–28)
  const active = members.filter((m) => {
    const cohort = (m as any).cohorts as { name: string; start_date: string } | null;
    if (!cohort) return false;
    const startMs = new Date(cohort.start_date + "T00:00:00").getTime();
    const todayMs = new Date(today + "T00:00:00").getTime();
    const day = Math.floor((todayMs - startMs) / 86400000) + 1;
    return day >= 1 && day <= 28;
  });

  if (!active.length) return new Response("No active cohort members to nudge", { status: 200 });

  // Get emails from auth.users
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = Object.fromEntries(users.map((u) => [u.id, u.email]));

  let sent = 0;
  for (const m of active) {
    const email = emailMap[m.user_id];
    if (!email) continue;

    const cohort = (m as any).cohorts as { name: string; start_date: string };
    const startMs = new Date(cohort.start_date + "T00:00:00").getTime();
    const todayMs = new Date(today + "T00:00:00").getTime();
    const day = Math.floor((todayMs - startMs) / 86400000) + 1;

    await resend.emails.send({
      from: "MoveYourMatter <suparna@moveyourmatter.com>",
      to: email,
      subject: `Day ${day} is waiting for you`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#292524;">
          <p style="color:#0f766e;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 24px;">MoveYourMatter</p>
          <h1 style="font-size:24px;font-weight:600;margin:0 0 12px;">Day ${day} is waiting for you</h1>
          <p style="color:#78716c;line-height:1.6;margin:0 0 24px;">
            You're on Day ${day} of your 28-day brain health journey with ${cohort.name}.
            Your next video is ready — it only takes a few minutes.
          </p>
          <a href="https://moveyourmatter.com/videos" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:600;font-size:15px;">
            Watch today's video →
          </a>
          <p style="color:#a8a29e;font-size:12px;margin:32px 0 0;">
            You're receiving this because you're enrolled in ${cohort.name}.
          </p>
        </div>
      `,
    });
    sent++;
  }

  return new Response(JSON.stringify({ sent }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
