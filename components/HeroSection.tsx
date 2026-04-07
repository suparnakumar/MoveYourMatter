// Shared hero section for marketing pages (About, Programs, Blog).
// HomeHero has a distinct layout with CTAs so it remains its own component.

export default function HeroSection({
  eyebrow,
  heading,
  subheading,
}: {
  eyebrow: string;
  heading: string;
  subheading: string;
}) {
  return (
    <section className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">
          {eyebrow}
        </p>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">{heading}</h1>
        <p className="text-teal-100 text-xl leading-relaxed max-w-2xl mx-auto">
          {subheading}
        </p>
      </div>
    </section>
  );
}
