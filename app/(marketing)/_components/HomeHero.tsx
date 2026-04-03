import Link from "next/link";
import { hero } from "@/app/(marketing)/content";

export default function HomeHero() {
  return (
    <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent" />
      <div className="max-w-6xl mx-auto px-6 py-28 md:py-40 relative">
        <div className="max-w-3xl">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">{hero.eyebrow}</p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">{hero.heading}</h1>
          <p className="text-xl md:text-2xl text-teal-100 leading-relaxed mb-10 max-w-2xl">{hero.subheading}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={hero.primaryCta.href} className="px-8 py-4 rounded-full bg-amber-400 text-teal-900 font-bold text-lg hover:bg-amber-300 transition-colors text-center">
              {hero.primaryCta.label}
            </Link>
            <Link href={hero.secondaryCta.href} className="px-8 py-4 rounded-full border-2 border-white/40 text-white font-semibold text-lg hover:border-white hover:bg-white/10 transition-colors text-center">
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
