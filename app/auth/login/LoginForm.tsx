"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/home";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(next);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-6">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-10">
          <p className="text-teal-700 text-sm font-medium tracking-widest uppercase mb-3">MoveYourMatter</p>
          <h1 className="text-3xl font-semibold text-stone-900 leading-tight">Welcome back</h1>
          <p className="text-stone-500 mt-2">Sign in to continue your practice</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Email / password form */}
        <form onSubmit={handleEmailLogin} className="space-y-3 mb-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <div className="text-right mt-1.5">
              <a href="/auth/forgot-password" className="text-xs text-teal-700 hover:underline">
                Forgot password?
              </a>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-teal-700 text-white font-medium hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in…
              </span>
            ) : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-stone-400 text-xs">or</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-800 font-medium shadow-sm hover:shadow-md hover:border-stone-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-stone-300 border-t-teal-600 rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
          )}
          {googleLoading ? "Signing in…" : "Continue with Google"}
        </button>

        <p className="text-center text-stone-400 text-sm mt-8">
          New here?{" "}
          <a href="/auth/signup" className="text-teal-700 font-medium hover:underline">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
