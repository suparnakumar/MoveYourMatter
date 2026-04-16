"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          onboarding_complete: true,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If session is returned immediately (email confirmation disabled), go home
    if (data.session) {
      router.push("/home");
    } else {
      // Email confirmation required — show message
      setEmailSent(true);
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-6">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">Check your email</h1>
          <p className="text-stone-500 text-sm">
            We sent a confirmation link to <span className="font-medium text-stone-700">{email}</span>.
            Click it to activate your account and you&apos;re in.
          </p>
          <a href="/auth/login" className="inline-block mt-8 text-teal-700 text-sm font-medium hover:underline">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-teal-700 text-sm font-medium tracking-widest uppercase mb-3">MoveYourMatter</p>
          <h1 className="text-3xl font-semibold text-stone-900 leading-tight">Create your account</h1>
          <p className="text-stone-500 mt-2">Join the cohort and start moving</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <input
            type="tel"
            placeholder="Phone number (for WhatsApp group)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-teal-700 text-white font-medium hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating account…
              </span>
            ) : "Create account"}
          </button>
        </form>

        <p className="text-center text-stone-400 text-sm mt-8">
          Already have an account?{" "}
          <a href="/auth/login" className="text-teal-700 font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
