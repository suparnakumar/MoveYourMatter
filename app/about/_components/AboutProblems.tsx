import { problems } from "../content";

export default function AboutProblems() {
  return (
    <section className="bg-stone-100 py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">{problems.eyebrow}</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{problems.heading}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {problems.items.map(({ title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-8">
              <h3 className="text-lg font-bold mb-3 text-teal-800">{title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
