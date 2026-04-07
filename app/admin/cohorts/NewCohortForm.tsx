"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewCohortForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate) { setError("Name and start date are required."); return; }

    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: dbError } = await supabase.from("cohorts").insert({
      name: name.trim(),
      start_date: startDate,
      whatsapp_link: whatsappLink.trim() || null,
      active: true,
    });

    if (dbError) { setError(dbError.message); setSaving(false); return; }

    setName("");
    setStartDate("");
    setWhatsappLink("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Cohort name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. April 2026 Cohort"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">WhatsApp group link</label>
          <input
            type="url"
            value={whatsappLink}
            onChange={(e) => setWhatsappLink(e.target.value)}
            placeholder="https://chat.whatsapp.com/…"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {error && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-xl">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors disabled:opacity-50"
      >
        {saving ? "Creating…" : "Create cohort"}
      </button>
    </form>
  );
}
