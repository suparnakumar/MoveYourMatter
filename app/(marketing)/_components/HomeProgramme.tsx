import Link from "next/link";
import { programme } from "@/app/(marketing)/content";

export default function HomeProgramme() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
      <div className="text-center mb-12">
        <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">{programme.eyebrow}</p>
        <h2 className="text-4xl md:text-5xl font-bold">{programme.heading}</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {programme.items.map(({ label, title, desc }) => (
          <div key={label} className="border border-stone-200 rounded-2xl p-8 hover:border-teal-300 hover:shadow-md transition-all">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-3">{label}</p>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link href={programme.cta.href} className="px-8 py-3 rounded-full bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors">
          {programme.cta.label}
        </Link>
      </div>
    </section>
  );
}
