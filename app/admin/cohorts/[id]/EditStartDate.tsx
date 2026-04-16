"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function EditStartDate({ cohortId, current }: { cohortId: string; current: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("cohorts")
      .update({ start_date: value })
      .eq("id", cohortId);

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4">
        <p className="text-xs text-stone-400 mb-2">Start date</p>
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
        />
        {error && <p className="text-xs text-rose-600 mb-2">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => { setEditing(false); setValue(current); }}
            className="px-3 py-1.5 rounded-lg text-stone-500 text-xs hover:text-stone-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4">
      <p className="text-xs text-stone-400 mb-1">Start date</p>
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-stone-800">{current}</p>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-stone-400 hover:text-teal-700 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
