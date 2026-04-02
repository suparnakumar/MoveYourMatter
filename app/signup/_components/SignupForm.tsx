"use client";
import { useState } from "react";
import Link from "next/link";
import { page, goals, socialProof, success } from "../content";

export default function SignupForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", goal: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <p className="text-5xl mb-6">{success.icon}</p>
        <h2 className="text-3xl font-bold mb-4">{success.heading}</h2>
        <p className="text-stone-500 mb-8">{success.body(form.name.split(" ")[0])}</p>
        <Link href={success.cta.href} className="px-8 py-3 rounded-full bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors">
          {success.cta.label}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-10">
        <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">{page.eyebrow}</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{page.heading}</h1>
        <p className="text-stone-500 text-lg">{page.subheading}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="name">Full Name</label>
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
          <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="email">Email Address</label>
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
          <label className="block text-sm font-medium text-stone-700 mb-2" htmlFor="goal">What&apos;s your main goal?</label>
          <select
            id="goal"
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-stone-900"
          >
            <option value="">Select a goal...</option>
            {goals.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-teal-700 text-white font-bold text-lg hover:bg-teal-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Joining…" : page.submitLabel}
        </button>
      </form>

      {error && <p className="text-center text-red-600 text-sm mt-4">{error}</p>}

      <p className="text-center text-stone-400 text-sm mt-6">{page.disclaimer}</p>

      <div className="mt-10 pt-8 border-t border-stone-200 grid grid-cols-3 gap-4 text-center">
        {socialProof.map(({ value, label }) => (
          <div key={label}>
            <p className="font-bold text-teal-700 text-lg">{value}</p>
            <p className="text-stone-400 text-xs">{label}</p>
          </div>
        ))}
      </div>
    </>
  );
}
