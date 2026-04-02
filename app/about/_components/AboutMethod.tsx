import { method } from "../content";

export default function AboutMethod() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20 md:py-28">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">{method.eyebrow}</p>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">{method.heading}</h2>
        </div>
        <div className="space-y-5">
          {method.body.map((para, i) => (
            <p key={i} className="text-stone-600 leading-relaxed">{para}</p>
          ))}
        </div>
      </div>
      <div className="mt-12 grid md:grid-cols-2 gap-4">
        <div className="border border-stone-200 rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-3">Eastern — Bottom-Up</p>
          <p className="text-sm text-stone-600 leading-relaxed">Body first. The body is the doorway to the mind. Regulate breath, posture, and movement — and mental clarity follows. Yoga, Tai Chi, Kathak have practised this for centuries.</p>
        </div>
        <div className="border border-stone-200 rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-3">Western — Catching Up</p>
          <p className="text-sm text-stone-600 leading-relaxed">Science now confirms what tradition always knew. Bottom-up, somatic approaches to brain training are not complementary — they are foundational. The body is not separate from the brain. It is its fastest path.</p>
        </div>
      </div>
    </section>
  );
}
