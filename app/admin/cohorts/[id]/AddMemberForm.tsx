"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddMemberForm({ cohortId }: { cohortId: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) { setError("User ID is required."); return; }

    setSaving(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();

    const { error: dbError } = await supabase.from("cohort_members").insert({
      cohort_id: cohortId,
      user_id: userId.trim(),
    });

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    setUserId("");
    setSaving(false);
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="block text-xs font-medium text-stone-500 mb-1">
          User ID <span className="font-normal text-stone-400">(from Supabase Auth dashboard)</span>
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => { setUserId(e.target.value); setSuccess(false); }}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {saving ? "Adding…" : "Add member"}
      </button>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {success && <p className="text-sm text-teal-600">Added ✓</p>}
    </form>
  );
}
