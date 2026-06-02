"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-2 rounded-xl bg-stone-100 text-stone-600 text-xs font-medium hover:bg-stone-200 transition-colors whitespace-nowrap"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
