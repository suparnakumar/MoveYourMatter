import Link from "next/link";

const values = [
  { icon: "🔬", title: "Science First", desc: "Every protocol is grounded in peer-reviewed neuroscience and movement research." },
  { icon: "🎭", title: "Beauty in Motion", desc: "Rooted in classical Kathak dance — movement that is both rigorous and joyful." },
  { icon: "🌱", title: "Accessible Growth", desc: "Designed for real lives. No gym required. No prior experience needed." },
  { icon: "🤝", title: "Community", desc: "A growing collective of curious minds committed to brain-body health." },
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">Our Story</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">The fusion of two worlds.</h1>
          <p className="text-teal-100 text-xl leading-relaxed max-w-2xl mx-auto">
            Where classical dance meets cognitive neuroscience — and where movement becomes medicine for the modern mind.
          </p>
        </div>
      </section>

      {/* Founder Story */}
      <section className="max-w-4xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="bg-gradient-to-br from-teal-50 to-amber-50 rounded-3xl p-10 text-center">
            <div className="w-24 h-24 rounded-full bg-teal-200 mx-auto mb-6 flex items-center justify-center text-4xl">
              🌀
            </div>
            <p className="text-xl font-bold text-teal-800 mb-2">Lifelong Kathak Dancer</p>
            <p className="text-stone-500 text-sm">Decades exploring the connection between movement and the mind</p>
            <div className="mt-6 pt-6 border-t border-teal-100">
              <p className="text-xl font-bold text-teal-800 mb-2">Software Engineer & Creator</p>
              <p className="text-stone-500 text-sm">Building brain-body programs that unlock cognitive potential</p>
            </div>
          </div>
          <div>
            <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">The Founder</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
              Two disciplines, one mission.
            </h2>
            <p className="text-stone-600 leading-relaxed mb-4">
              As a lifelong Indian classical Kathak dancer, I&apos;ve spent decades exploring the profound connection between movement and the mind. The discipline, the rhythm, the intentional sequencing of every gesture — it all builds something deeper than physical skill.
            </p>
            <p className="text-stone-600 leading-relaxed mb-4">
              As a software engineer, I&apos;ve studied the science behind what I felt intuitively: that intentional movement can unlock cognitive potential, boost creativity, and fight mental fatigue.
            </p>
            <p className="text-stone-600 leading-relaxed mb-8">
              MoveYourMatter is the fusion of those worlds — a way to bring brain science to life through movement that&apos;s beautiful, challenging, and profoundly human.
            </p>
            <Link href="/signup" className="px-6 py-3 rounded-full bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors">
              Join the Community
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="bg-stone-100 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">Why We Exist</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Three problems worth solving.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Brain Fog & Burnout", desc: "Chronic stress, poor movement habits, and fragmented attention erode mental clarity. We need an antidote that fits real life." },
              { title: "Under-used Neuroplasticity", desc: "The brain is built to rewire, but most of us don&apos;t intentionally train it beyond daily routines. There&apos;s enormous untapped potential." },
              { title: "Mind-Body Disconnect", desc: "We treat mental and physical fitness as separate worlds — when in reality they thrive together and weaken apart." },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8">
                <h3 className="text-lg font-bold mb-3 text-teal-800">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-14">
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">What We Stand For</p>
          <h2 className="text-4xl md:text-5xl font-bold">Our values.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ icon, title, desc }) => (
            <div key={title} className="text-center p-8 rounded-2xl border border-stone-200 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
              <p className="text-4xl mb-4">{icon}</p>
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-900 text-white py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to rewire?</h2>
          <p className="text-teal-200 text-lg mb-8">Join a community committed to thinking clearly, moving purposefully, and living fully.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-3 rounded-full bg-amber-400 text-teal-900 font-bold hover:bg-amber-300 transition-colors">
              Get Started
            </Link>
            <Link href="/programs" className="px-8 py-3 rounded-full border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-colors">
              Explore Programs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
