"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteCohortButton({ cohortId, cohortName }: { cohortId: string; cohortName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("cohorts").delete().eq("id", cohortId);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500">Delete &ldquo;{cohortName}&rdquo;?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-medium text-rose-600 hover:text-rose-800 transition-colors disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs font-medium text-stone-400 hover:text-rose-600 transition-colors"
    >
      Delete
    </button>
  );
}
