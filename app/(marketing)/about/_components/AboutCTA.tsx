import Link from "next/link";
import { cta } from "../content";

export default function AboutCTA() {
  return (
    <section className="bg-teal-900 text-white py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{cta.heading}</h2>
        <p className="text-teal-200 text-lg mb-8">{cta.body}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={cta.primaryCta.href} className="px-8 py-3 rounded-full bg-amber-400 text-teal-900 font-bold hover:bg-amber-300 transition-colors">
            {cta.primaryCta.label}
          </Link>
          <Link href={cta.secondaryCta.href} className="px-8 py-3 rounded-full border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-colors">
            {cta.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
