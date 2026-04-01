import Link from "next/link";

const programs = [
  {
    id: "micro-focus",
    title: "Micro Focus",
    duration: "5–10 min",
    level: "All Levels",
    tag: "Quick Reset",
    tagColor: "bg-amber-100 text-amber-700",
    description:
      "Designed for the middle of a busy day. These short sequences use targeted eye movements, breath patterns, and simple coordination drills to instantly sharpen attention and clear mental fog.",
    benefits: ["Improved attention span", "Reduced mental fatigue", "Calm alertness", "Works at your desk"],
  },
  {
    id: "brain-body-flow",
    title: "Brain-Body Flow",
    duration: "20–30 min",
    level: "Beginner – Intermediate",
    tag: "Core Practice",
    tagColor: "bg-teal-100 text-teal-700",
    description:
      "Full integration sessions that blend rhythmic movement patterns with cognitive drills. Rooted in classical Kathak principles, these flows challenge your coordination while strengthening neural pathways.",
    benefits: ["Enhanced memory", "Greater cognitive flexibility", "Stress reduction", "Improved coordination"],
  },
  {
    id: "deep-rewire",
    title: "Deep Rewire",
    duration: "45–60 min",
    level: "Intermediate – Advanced",
    tag: "Deep Work",
    tagColor: "bg-purple-100 text-purple-700",
    description:
      "Intensive protocols built for neuroplasticity, creative breakthroughs, and long-term mental resilience. These sessions combine complex movement sequences with deliberate cognitive load training.",
    benefits: ["Long-term neuroplasticity", "Creative problem-solving", "Mental resilience", "Deep presence"],
  },
  {
    id: "kathak-cognition",
    title: "Kathak & Cognition",
    duration: "30–45 min",
    level: "All Levels",
    tag: "Signature",
    tagColor: "bg-rose-100 text-rose-700",
    description:
      "Our signature program. Drawing directly from 30+ years of classical Kathak dance training, these sessions use the footwork, hand gestures (mudras), and rhythmic cycles of Kathak to train your brain in ways no other movement system can.",
    benefits: ["Rhythm & timing", "Bilateral coordination", "Focus under complexity", "Cultural richness"],
  },
];

export default function Programs() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">Programs</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Find your practice.</h1>
          <p className="text-teal-100 text-xl leading-relaxed max-w-2xl mx-auto">
            Every program is built around one principle: intentional movement creates lasting cognitive change. Choose what fits your life.
          </p>
        </div>
      </section>

      {/* Programs List */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28 space-y-8">
        {programs.map(({ id, title, duration, level, tag, tagColor, description, benefits }) => (
          <div key={id} className="border border-stone-200 rounded-3xl p-8 md:p-10 hover:border-teal-300 hover:shadow-lg transition-all">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${tagColor}`}>{tag}</span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-600">{level}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
                <p className="text-amber-600 font-semibold mt-1">{duration} per session</p>
              </div>
              <Link
                href="/signup"
                className="px-6 py-3 rounded-full bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors whitespace-nowrap"
              >
                Get Access
              </Link>
            </div>
            <p className="text-stone-600 leading-relaxed mb-6">{description}</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-2 text-sm text-stone-600">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                  {b}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* How It Works */}
      <section className="bg-stone-100 py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-4xl font-bold">How it works.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Choose Your Program", desc: "Pick based on your time, experience level, and goal — from a 5-minute reset to a deep 60-minute rewire." },
              { step: "02", title: "Follow the Protocol", desc: "Each session guides you through precisely sequenced movements. No equipment needed — just your body and attention." },
              { step: "03", title: "Feel the Shift", desc: "Consistent practice rewires your neural pathways. Most members notice measurable changes within 4 weeks." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-8">
                <p className="text-5xl font-bold text-teal-100 mb-4">{step}</p>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-900 text-white py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start your first session today.</h2>
          <p className="text-teal-200 text-lg mb-8">All programs are accessible from any device. No gym, no gear, no excuses.</p>
          <Link href="/signup" className="px-10 py-4 rounded-full bg-amber-400 text-teal-900 font-bold text-lg hover:bg-amber-300 transition-colors">
            Join Now — It&apos;s Free
          </Link>
        </div>
      </section>
    </>
  );
}
