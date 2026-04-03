import Link from "next/link";
import { cta } from "../content";

export default function ProgramsCTA() {
  return (
    <section className="bg-teal-900 text-white py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{cta.heading}</h2>
        <p className="text-teal-200 text-lg mb-8">{cta.body}</p>
        <Link href={cta.href} className="px-10 py-4 rounded-full bg-amber-400 text-teal-900 font-bold text-lg hover:bg-amber-300 transition-colors">
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
