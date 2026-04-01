import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
        <p className="font-semibold text-teal-700">MoveYourMatter</p>
        <div className="flex gap-6">
          <Link href="/programs" className="hover:text-teal-700 transition-colors">Programs</Link>
          <Link href="/blog" className="hover:text-teal-700 transition-colors">Blog</Link>
          <Link href="/about" className="hover:text-teal-700 transition-colors">About</Link>
          <Link href="/signup" className="hover:text-teal-700 transition-colors">Sign Up</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} MoveYourMatter. All rights reserved.</p>
      </div>
    </footer>
  );
}
