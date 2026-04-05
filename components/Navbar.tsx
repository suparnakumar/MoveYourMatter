"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
    });
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="MoveYourMatter" width={140} height={48} className="h-10 w-auto object-contain" priority />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-teal-700 ${
                pathname === href ? "text-teal-700" : "text-stone-600"
              }`}
            >
              {label}
            </Link>
          ))}
          {loggedIn ? (
            <Link
              href="/home"
              className="ml-2 px-4 py-2 rounded-full bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors"
            >
              Go to practice
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-stone-600 hover:text-teal-700 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/onboarding"
                className="ml-2 px-4 py-2 rounded-full bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors"
              >
                Try it free
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-stone-600"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-stone-200 bg-stone-50 px-6 py-4 flex flex-col gap-4">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`text-sm font-medium ${pathname === href ? "text-teal-700" : "text-stone-600"}`}
            >
              {label}
            </Link>
          ))}
          {loggedIn ? (
            <Link
              href="/home"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-full bg-teal-700 text-white text-sm font-medium text-center"
            >
              Go to practice
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-stone-600"
              >
                Sign in
              </Link>
              <Link
                href="/onboarding"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-full bg-teal-700 text-white text-sm font-medium text-center"
              >
                Try it free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
