"use client";
import { useState } from "react";
import Link from "next/link";

export default function Signup() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", goal: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up to backend / email provider
    setSubmitted(true);
  }

  return (
    <>
      <section className="min-h-[80vh] flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md">
          {submitted ? (
            <div className="text-center">
              <p className="text-5xl mb-6">🎉</p>
              <h2 className="text-3xl font-bold mb-4">You&apos;re in!</h2>
              <p className="text-stone-500 mb-8">
                Welcome to MoveYourMatter, {form.name.split(" ")[0]}. Check your inbox for a confirmation email and your first movement protocol.
              </p>
              <Link href="/programs" className="px-8 py-3 rounded-full bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors">
                Explore Programs
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">Get Started</p>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Join the movement.</h1>
                <p className="text-stone-500 text-lg">
                  Free access to protocols, articles, and a community built around brain-body health.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-stone-900 placeholder-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-stone-900 placeholder-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="goal">
                    What&apos;s your main goal?
                  </label>
                  <select
                    id="goal"
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-stone-900"
                  >
                    <option value="">Select a goal...</option>
                    <option value="focus">Improve focus & concentration</option>
                    <option value="fog">Reduce brain fog & fatigue</option>
                    <option value="resilience">Build mental resilience</option>
                    <option value="creativity">Boost creativity</option>
                    <option value="all">All of the above</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-teal-700 text-white font-bold text-lg hover:bg-teal-800 transition-colors"
                >
                  Join MoveYourMatter
                </button>
              </form>

              <p className="text-center text-stone-400 text-sm mt-6">
                No spam. No credit card. Just movement.
              </p>

              <div className="mt-10 pt-8 border-t border-stone-200 grid grid-cols-3 gap-4 text-center">
                {[
                  { value: "Free", label: "Always" },
                  { value: "500+", label: "Members" },
                  { value: "4 wks", label: "To results" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="font-bold text-teal-700 text-lg">{value}</p>
                    <p className="text-stone-400 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
