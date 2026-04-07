"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  {
    href: "/home",
    label: "Home",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    href: "/practice",
    label: "Practice",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    href: "/coach",
    label: "Coach",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href: "/blog",
    label: "Blog",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
];

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
        <div className="flex items-center gap-8">
          <Link href="/home" className="flex items-center">
            <Image src="/logo.png" alt="MoveYourMatter" width={120} height={40} className="h-8 w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-5">
            {tabs.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors hover:text-teal-700 ${
                  pathname.startsWith(href) ? "text-teal-700" : "text-stone-500"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-stone-400 hover:text-rose-500 transition-colors"
        >
          Sign out
        </button>
      </nav>
    );
  }

  return (
    <nav className="border-t border-stone-200 bg-white flex items-center justify-around px-2 py-2">
      {tabs.map(({ href, label, icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
              active ? "text-teal-700" : "text-stone-400"
            }`}
          >
            {icon}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
