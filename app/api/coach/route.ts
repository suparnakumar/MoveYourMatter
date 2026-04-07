import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { currentRasaWeek } from "@/lib/bss";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RASA_INSIGHTS: Record<string, string> = {
  veera:    "Veera (Heroism) — activates your prefrontal cortex for bold decision-making and focused action.",
  karuna:   "Karuna (Compassion) — strengthens emotional regulation and empathy circuits in the brain.",
  shanta:   "Shanta (Peace) — quiets the default mode network, deepening clarity and inner calm.",
  hasya:    "Hasya (Joy) — triggers dopamine and serotonin pathways, boosting creativity and motivation.",
  raudra:   "Raudra (Passion) — channels intense focus and energy for high-stakes cognitive performance.",
  bhayanaka:"Bhayanaka (Awe/Fear) — processes stress responses and builds resilience through movement.",
  bibhatsa: "Bibhatsa (Discernment) — sharpens pattern recognition and the ability to set clear boundaries.",
  adbhuta:  "Adbhuta (Wonder) — activates curiosity networks, priming the brain for learning and growth.",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { messages } = await req.json();

  // Load user context
  const rasaWeek = currentRasaWeek();
  const today = new Date().toISOString().split("T")[0];

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

  const name = profile?.display_name?.split(" ")[0] ?? "there";
  const streak_count = streak?.current_streak ?? 0;
  const goal = profile?.goal ?? "general wellbeing";
  const rasaName = rasa?.name ?? "Veera";
  const rasaSlug = rasa?.slug ?? "veera";
  const rasaTheme = rasa?.theme ?? "Focus, courage";
  const rasaInsight = RASA_INSIGHTS[rasaSlug] ?? "";
  const avgBss = recentSessions?.length
    ? Math.round(recentSessions.reduce((s, r) => s + (r.brain_shift_score ?? 50), 0) / recentSessions.length)
    : null;

  const systemPrompt = `You are a warm, knowledgeable AI coach for MoveYourMatter — a platform that uses Kathak dance movement to train the brain. You combine expertise in neuroscience, movement, and mindfulness.

The person you're speaking with:
- Name: ${name}
- Practice goal: ${goal}
- Current streak: ${streak_count} days
- Average Brain Shift Score (last 7 sessions): ${avgBss !== null ? avgBss : "no sessions yet"}
- This week's rasa: ${rasaName} (${rasaTheme})
- Rasa brain insight: ${rasaInsight}

About MoveYourMatter:
- 7-minute daily Kathak movement sessions train cognitive functions (focus, energy, calm)
- Each week is themed around a Rasa — an ancient Indian concept of emotional essence
- Brain Shift Score (BSS) measures cognitive shift before and after each session (0–100)
- The DOSE framework: Dopamine, Oxytocin, Serotonin, Endorphin — all activated through movement

Your coaching style:
- Warm, direct, encouraging — like a trusted guide, not a chatbot
- Ground advice in neuroscience and movement science when relevant
- Keep responses concise (2–4 short paragraphs max) unless the question needs depth
- Celebrate streaks and progress genuinely
- When asked about movement or Kathak, relate it to brain benefits
- Don't give medical advice; refer to professionals for health concerns
- Never mention you are built on Claude or any specific AI model`;

  const stream = await anthropic.messages.stream({
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
