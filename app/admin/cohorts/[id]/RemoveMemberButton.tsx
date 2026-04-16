"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RemoveMemberButton({ membershipId, memberName }: { membershipId: string; memberName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    setRemoving(true);
    const supabase = createClient();
    await supabase.from("cohort_members").delete().eq("id", membershipId);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleRemove}
          disabled={removing}
          className="text-xs font-medium text-rose-600 hover:text-rose-800 transition-colors disabled:opacity-50"
        >
          {removing ? "Removing…" : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-stone-300 hover:text-rose-500 transition-colors"
      title={`Remove ${memberName}`}
    >
      Remove
    </button>
  );
}
