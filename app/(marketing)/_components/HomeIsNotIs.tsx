import { isNotIs, foundingTruth } from "@/app/(marketing)/content";

export default function HomeIsNotIs() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">{isNotIs.heading}</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <div className="border border-stone-200 rounded-2xl p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">This is not</p>
          <ul className="space-y-3">
            {isNotIs.isNot.map((item) => (
              <li key={item} className="flex items-center gap-3 text-stone-500">
                <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-teal-200 bg-teal-50/40 rounded-2xl p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-5">This is</p>
          <ul className="space-y-3">
            {isNotIs.is.map((item) => (
              <li key={item} className="flex items-center gap-3 text-stone-700 font-medium">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-l-4 border-teal-600 pl-6 max-w-3xl mx-auto">
        <p className="text-lg text-stone-600 italic leading-relaxed">{foundingTruth.body}</p>
      </div>
    </section>
  );
}
