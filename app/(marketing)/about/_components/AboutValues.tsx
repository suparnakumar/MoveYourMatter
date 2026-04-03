import { values } from "../content";

export default function AboutValues() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20 md:py-28">
      <div className="text-center mb-14">
        <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">{values.eyebrow}</p>
        <h2 className="text-4xl md:text-5xl font-bold">{values.heading}</h2>
      </div>
      <div className="space-y-6">
        {values.items.map(({ number, title, subtitle, belief, nonnegotiable, accentColor, accentBorder, neverBg }) => (
          <div key={number} className={`border ${accentBorder} rounded-3xl overflow-hidden`}>
            <div className="p-8 md:p-10">
              <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${accentColor}`}>Value {number}</p>
              <h3 className="text-2xl md:text-3xl font-bold leading-tight mb-1 whitespace-pre-line">{title}</h3>
              <p className={`text-sm italic mb-6 ${accentColor}`}>{subtitle}</p>
              <p className="text-stone-600 leading-relaxed">{belief}</p>
            </div>
            <div className={`px-8 md:px-10 pb-8 md:pb-10`}>
              <p className={`text-sm font-semibold px-4 py-3 rounded-xl inline-block ${neverBg}`}>
                Non-negotiable: {nonnegotiable}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
