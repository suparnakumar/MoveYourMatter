"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddMemberForm({ cohortId }: { cohortId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [resolvedUser, setResolvedUser] = useState<{ id: string; email: string; full_name?: string } | null>(null);
  const [looking, setLooking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLooking(true);
    setError(null);
    setResolvedUser(null);
    setSuccess(false);

    const res = await fetch(`/api/admin/find-user?email=${encodeURIComponent(email)}`);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "User not found");
      setLooking(false);
      return;
    }

    setResolvedUser(data);
    setLooking(false);
  }

  async function handleAdd() {
    if (!resolvedUser) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: dbError } = await supabase.from("cohort_members").insert({
      cohort_id: cohortId,
      user_id: resolvedUser.id,
    });

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    setEmail("");
    setResolvedUser(null);
    setSaving(false);
    setSuccess(true);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleLookup} className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-stone-500 mb-1">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setResolvedUser(null); setSuccess(false); setError(null); }}
            placeholder="member@example.com"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          type="submit"
          disabled={looking || !email}
          className="px-5 py-2 rounded-xl bg-stone-100 text-stone-700 text-sm font-medium hover:bg-stone-200 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {looking ? "Looking up…" : "Look up"}
        </button>
      </form>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {success && <p className="text-sm text-teal-600">Member added ✓</p>}

      {resolvedUser && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-teal-50 border border-teal-100">
          <div>
            <p className="text-sm font-medium text-stone-800">{resolvedUser.full_name ?? resolvedUser.email}</p>
            {resolvedUser.full_name && (
              <p className="text-xs text-stone-400">{resolvedUser.email}</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Adding…" : "Add to cohort"}
          </button>
        </div>
      )}
    </div>
  );
}
