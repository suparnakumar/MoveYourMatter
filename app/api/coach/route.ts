import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
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

  // Load user context
  const rasaWeek = currentRasaWeek();

  const [{ data: profile }, { data: streak }, { data: rasa }, { data: recentSessions }] =
    await Promise.all([
      supabase.from("profiles").select("display_name, goal").eq("id", user.id).single(),
      supabase.from("streaks").select("current_streak").eq("user_id", user.id).maybeSingle(),
      supabase.from("rasas").select("name, theme, slug").eq("week_number", rasaWeek).single(),
      supabase.from("practice_sessions")
        .select("brain_shift_score, session_date")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("session_date", { ascending: false })
        .limit(7),
    ]);

  const rasaSlug = rasa?.slug ?? "veera";
  const systemPrompt = buildCoachSystemPrompt({
    name: profile?.display_name?.split(" ")[0] ?? "there",
    goal: profile?.goal ?? "general wellbeing",
    streak: streak?.current_streak ?? 0,
    avgBss: recentSessions?.length
      ? Math.round(recentSessions.reduce((s, r) => s + (r.brain_shift_score ?? 50), 0) / recentSessions.length)
      : null,
    rasaName: rasa?.name ?? "Veera",
    rasaTheme: rasa?.theme ?? "Focus, courage",
    rasaInsight: RASA_INSIGHTS[rasaSlug] ?? "",
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
