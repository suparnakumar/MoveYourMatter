"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AppNav({ variant = "bottom" }: { variant?: "top" | "bottom" }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (variant === "top") {
    return (
      <nav className="border-b border-stone-200 bg-white px-8 h-14 flex items-center justify-between">
        <Link href="/home" className="flex items-center">
          <Image src="/logo.png" alt="MoveYourMatter" width={120} height={40} className="h-8 w-auto object-contain" priority />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/home" className={`text-sm font-medium transition-colors hover:text-teal-700 ${pathname === "/home" ? "text-teal-700" : "text-stone-500"}`}>
            Home
          </Link>
          <Link href="/practice" className={`text-sm font-medium transition-colors hover:text-teal-700 ${pathname === "/practice" ? "text-teal-700" : "text-stone-500"}`}>
            Practice
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-stone-400 hover:text-rose-500 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-t border-stone-200 bg-white flex items-center justify-around px-4 py-3">
      <Link href="/home" className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${pathname === "/home" ? "text-teal-700" : "text-stone-400"}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
        Home
      </Link>

      <Link href="/practice" className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${pathname === "/practice" ? "text-teal-700" : "text-stone-400"}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none"/>
        </svg>
        Practice
      </Link>

      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-0.5 text-xs font-medium text-stone-400 hover:text-rose-500 transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign out
      </button>
    </nav>
  );
}
