import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this is a new user completing onboarding
      const { data: { user } } = await supabase.auth.getUser();
      const isNew = user?.user_metadata?.onboarding_complete !== true;

      if (isNew && next === "/home") {
        // New user — send to step 6 of onboarding (question screen)
        return NextResponse.redirect(`${origin}/onboarding/goal`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
