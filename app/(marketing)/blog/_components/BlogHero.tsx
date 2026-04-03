import { hero } from "../content";

export default function BlogHero() {
  return (
    <section className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">{hero.eyebrow}</p>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">{hero.heading}</h1>
        <p className="text-teal-100 text-xl leading-relaxed max-w-2xl mx-auto">{hero.subheading}</p>
      </div>
    </section>
  );
}
