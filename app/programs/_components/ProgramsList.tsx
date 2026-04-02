import Link from "next/link";
import { tiers } from "../content";

export default function ProgramsList() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20 md:py-28 space-y-8">
      {tiers.map(({ id, frequency, duration, title, subtitle, tagColor, description, whatYouDo, benefits }) => (
        <div key={id} className="border border-stone-200 rounded-3xl overflow-hidden hover:border-teal-300 hover:shadow-lg transition-all">
          {/* Header */}
          <div className="p-8 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${tagColor}`}>{frequency}</span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-600">{duration}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
                <p className="text-stone-400 italic text-sm mt-1">{subtitle}</p>
              </div>
              <Link href="/signup" className="px-6 py-3 rounded-full bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors whitespace-nowrap">
                Get Access
              </Link>
            </div>
            <p className="text-stone-600 leading-relaxed">{description}</p>
          </div>

          {/* What you do */}
          <div className="border-t border-stone-100 bg-stone-50 px-8 md:px-10 py-6">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">What you do</p>
            <div className="grid md:grid-cols-2 gap-3">
              {whatYouDo.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-stone-600">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="border-t border-stone-100 px-8 md:px-10 py-5 flex flex-wrap gap-2">
            {benefits.map((b) => (
              <span key={b} className="text-xs font-medium px-3 py-1 rounded-full border border-stone-200 text-stone-500">{b}</span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
