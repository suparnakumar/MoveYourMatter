import Link from "next/link";

const features = [
  {
    icon: "🧠",
    title: "Science-Backed Protocols",
    description: "Movement sequences designed around neuroscience research to stimulate neuroplasticity and sharpen cognitive function.",
  },
  {
    icon: "⚡",
    title: "Micro-Training Routines",
    description: "Results in minutes a day. Fit brain-body training into your busy life without overhauling your schedule.",
  },
  {
    icon: "🔄",
    title: "Brain-Body Integration",
    description: "Treat mental and physical fitness as one system — because your brain and body thrive together, not apart.",
  },
  {
    icon: "🎯",
    title: "Focus & Clarity",
    description: "Combat brain fog and burnout with intentional movement that creates new neural connections in real time.",
  },
];

const stats = [
  { value: "10 min", label: "Average session length" },
  { value: "3x", label: "Improvement in focus" },
  { value: "500+", label: "Community members" },
  { value: "4 weeks", label: "To feel the difference" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-6 py-28 md:py-40 relative">
          <div className="max-w-3xl">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">
              Brain &middot; Body &middot; Movement
            </p>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Move Your<br />
              <span className="text-amber-400">Matter.</span>
            </h1>
            <p className="text-xl md:text-2xl text-teal-100 leading-relaxed mb-10 max-w-2xl">
              When you move your body with purpose, you literally rewire your brain.
              Science-backed movement protocols for sharper focus, deeper presence, and greater resilience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-full bg-amber-400 text-teal-900 font-bold text-lg hover:bg-amber-300 transition-colors text-center"
              >
                Start Moving
              </Link>
              <Link
                href="/programs"
                className="px-8 py-4 rounded-full border-2 border-white/40 text-white font-semibold text-lg hover:border-white hover:bg-white/10 transition-colors text-center"
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-bold text-teal-700">{value}</p>
              <p className="text-sm text-stone-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem / Mission */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">Why It Matters</p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Your brain is waiting to be used.
            </h2>
            <p className="text-stone-600 text-lg leading-relaxed mb-4">
              We live in the Age of Cognitive Overload. Our bodies sit still while our minds sprint. Over time, this mismatch leaves us foggy, distracted, and drained.
            </p>
            <p className="text-stone-600 text-lg leading-relaxed mb-8">
              The most valuable skill of the future isn&apos;t knowing more — it&apos;s the ability to think clearly, adapt quickly, and stay mentally resilient. And that starts with how you move.
            </p>
            <Link href="/about" className="text-teal-700 font-semibold hover:underline">
              Learn about our approach &rarr;
            </Link>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-amber-50 rounded-3xl p-10 text-center">
            <p className="text-6xl mb-4">🧠</p>
            <p className="text-2xl font-bold text-teal-800 mb-3">Grey Matter is Your Superpower</p>
            <p className="text-stone-600 leading-relaxed">
              Complex, intentional movement creates new neural connections, improves cognitive flexibility, and sharpens focus. Every sequence is a chance to rewire.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-stone-100 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">What We Offer</p>
            <h2 className="text-4xl md:text-5xl font-bold">Train smarter. Move better. Think clearer.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-4xl mb-4">{icon}</p>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs teaser */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-12">
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">Programs</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Find your practice</h2>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">
            Whether you have 5 minutes or 50, there&apos;s a protocol designed for your schedule and goals.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { title: "Micro Focus", duration: "5–10 min", desc: "Quick cognitive resets for busy days. Sharp attention, anywhere." },
            { title: "Brain-Body Flow", duration: "20–30 min", desc: "Full integration sessions blending movement patterns with cognitive drills." },
            { title: "Deep Rewire", duration: "45–60 min", desc: "Intensive protocols for neuroplasticity, creativity, and long-term resilience." },
          ].map(({ title, duration, desc }) => (
            <div key={title} className="border border-stone-200 rounded-2xl p-8 hover:border-teal-300 hover:shadow-md transition-all">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">{duration}</p>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/programs" className="px-8 py-3 rounded-full bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors">
            View All Programs
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-900 text-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your brain&apos;s capacity to change isn&apos;t fixed.
          </h2>
          <p className="text-teal-200 text-xl mb-10 leading-relaxed">
            Every step, spin, stretch, and sequence is a chance to rewire your neural pathways. Start today — it only takes minutes.
          </p>
          <Link
            href="/signup"
            className="px-10 py-4 rounded-full bg-amber-400 text-teal-900 font-bold text-lg hover:bg-amber-300 transition-colors"
          >
            Join the Movement
          </Link>
        </div>
      </section>
    </>
  );
}
