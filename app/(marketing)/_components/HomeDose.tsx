import { dose } from "@/app/(marketing)/content";

export default function HomeDose() {
  return (
    <section className="bg-stone-100 py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">{dose.eyebrow}</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{dose.heading}</h2>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">{dose.subheading}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dose.items.map(({ letter, name, desc, color, bg, border }) => (
            <div key={letter} className={`${bg} border ${border} rounded-2xl p-6 text-center`}>
              <p className={`text-5xl font-bold mb-2 ${color}`}>{letter}</p>
              <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${color}`}>{name}</p>
              <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
