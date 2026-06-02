"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteVideoButton({ videoId, title }: { videoId: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const supabase = createClient();
    const { error: dbError } = await supabase.from("videos").delete().eq("id", videoId);
    if (dbError) {
      setError(dbError.message);
      setDeleting(false);
      setConfirming(false);
      return;
    }
    router.refresh();
  }

  if (error) {
    return <span className="text-xs text-rose-500">{error}</span>;
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-medium text-rose-600 hover:text-rose-800 transition-colors disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Confirm delete"}
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
      title={`Delete ${title}`}
    >
      Delete
    </button>
  );
}
