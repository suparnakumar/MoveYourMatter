"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/cohorts", label: "Cohorts" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-stone-200 px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/admin" className="flex items-center">
          <Image src="/logo.png" alt="MoveYourMatter" width={100} height={36} className="h-7 w-auto object-contain" priority />
        </Link>
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Admin</span>
        <div className="flex items-center gap-4">
          {links.map(({ href, label }) => (
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
      <Link href="/home" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
        ← Back to app
      </Link>
    </nav>
  );
}
