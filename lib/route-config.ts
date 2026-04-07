// Centralised route protection rules used by middleware.
// Update here when adding new protected or guest-only routes.

/** Routes that require the user to be signed in */
export const PROTECTED_ROUTES = ["/home", "/practice", "/admin", "/coach"];

/** Onboarding routes that are only reachable after Google sign-in */
export const POST_AUTH_ONBOARDING_ROUTES = ["/onboarding/goal", "/onboarding/schedule"];

/** Routes that signed-in users should not see */
export const GUEST_ONLY_ROUTES = ["/auth/login", "/onboarding"];
