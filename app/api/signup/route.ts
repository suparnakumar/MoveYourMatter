import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "MoveYourMatter <suparna@moveyourmatter.com>";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "suparna@moveyourmatter.com";

export async function POST(req: Request) {
  const { name, email, goal } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const firstName = name.split(" ")[0];

  const [welcome, notify] = await Promise.allSettled([
    resend.emails.send({
      from: FROM,
      to: email,
      subject: "You're in — here's what happens next",
      html: `
        <p>Hi ${firstName},</p>
        <p>Welcome to MoveYourMatter.</p>
        <p>You've joined the founding cohort — the people who understand, before it becomes obvious, that the brain needs a daily workout just as much as the body does.</p>
        <p>Over the next few days you'll hear from me about:</p>
        <ul>
          <li>What to expect in your first 7-minute session</li>
          <li>The science behind why this works</li>
          <li>How to build the habit without adding friction to your day</li>
        </ul>
        <p>In the meantime, if you have questions, reply to this email. I read every one.</p>
        <p>— Suparna<br>Founder, MoveYourMatter</p>
      `,
    }),
    resend.emails.send({
      from: FROM,
      to: NOTIFY_EMAIL,
      subject: `New signup: ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Goal:</strong> ${goal || "not specified"}</p>
      `,
    }),
  ]);

  if (welcome.status === "rejected") {
    console.error("Welcome email failed:", welcome.reason);
    return NextResponse.json({ error: "Failed to send confirmation email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
