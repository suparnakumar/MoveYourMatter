import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  PROTECTED_ROUTES,
  POST_AUTH_ONBOARDING_ROUTES,
  GUEST_ONLY_ROUTES,
  AUTH_UTILITY_ROUTES,
} from "@/lib/route-config";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do not remove this
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isPostAuthOnboarding = POST_AUTH_ONBOARDING_ROUTES.some((r) =>
    pathname.startsWith(r)
  );
  if (isPostAuthOnboarding && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    return NextResponse.redirect(loginUrl);
  }

  // Auth utility routes (e.g. reset-password) are always accessible
  const isAuthUtility = AUTH_UTILITY_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthUtility) return supabaseResponse;

  // Redirect signed-in users away from guest-only routes
  const isGuestOnly =
    GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname === "/auth/login";
  if (user && isGuestOnly) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/home";
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}
