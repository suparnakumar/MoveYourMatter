import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FROM = "MoveYourMatter <suparna@moveyourmatter.com>";

export async function POST(req: Request) {
  // Admin only
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Email service not configured" }, { status: 500 });

  const { memberEmail, memberName, cohortName, whatsappLink } = await req.json();
  if (!memberEmail) return NextResponse.json({ error: "memberEmail is required" }, { status: 400 });

  const firstName = memberName?.split(" ")[0] ?? "there";
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: FROM,
    to: memberEmail,
    subject: `You've been added to ${cohortName} — here's your WhatsApp group link`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fafaf9;">
        <p style="font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #0f766e; margin: 0 0 32px;">MoveYourMatter</p>

        <h1 style="font-size: 24px; font-weight: 600; color: #1c1917; margin: 0 0 12px;">You're in, ${firstName}.</h1>
        <p style="font-size: 15px; color: #78716c; margin: 0 0 24px; line-height: 1.6;">
          You've been added to <strong style="color: #1c1917;">${cohortName}</strong>. Your cohort community lives on WhatsApp — join the group to connect with everyone and get daily updates.
        </p>

        ${whatsappLink ? `
        <a href="${whatsappLink}" style="display: inline-block; background: #25d366; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; padding: 14px 28px; border-radius: 100px;">
          Join the WhatsApp group
        </a>
        ` : ""}

        <p style="font-size: 14px; color: #78716c; margin: 32px 0 0; line-height: 1.6;">
          Sign in to the app to access your daily practice: <a href="https://app.moveyourmatter.com" style="color: #0f766e;">app.moveyourmatter.com</a>
        </p>

        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 32px 0;" />
        <p style="font-size: 12px; color: #a8a29e; margin: 0;">Your brain is a muscle. Movement is the gym.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
