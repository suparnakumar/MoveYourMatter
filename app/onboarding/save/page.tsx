"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Screen 5: "Save your score" — sign-up framed as protecting the result, not creating an account
export default function SaveScore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleGoogle() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding/goal`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  // Get BSS from sessionStorage for display
  const bss = typeof window !== "undefined" ? sessionStorage.getItem("mym_bss") : null;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <div className="h-1 bg-teal-600 w-4/5" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-teal-50 border-4 border-teal-600 flex items-center justify-center mb-6">
          <span className="text-2xl font-bold text-teal-700">{bss ?? "–"}</span>
        </div>

        <h1 className="text-2xl font-semibold text-stone-900 mb-2">
          Save your score
        </h1>
        <p className="text-stone-500 max-w-xs mb-10">
          Keep your Brain Shift Score and start building your streak. Takes 10 seconds.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm w-full max-w-xs">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full max-w-xs flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-white border border-stone-200 text-stone-800 font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-stone-300 border-t-teal-600 rounded-full animate-spin" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
          )}
          {loading ? "Saving…" : "Continue with Google"}
        </button>

        <p className="text-stone-400 text-xs mt-6 max-w-xs">
          No spam. Your data is yours. You can delete your account at any time.
        </p>
      </div>
    </div>
  );
}
