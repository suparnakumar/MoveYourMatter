import { stats } from "@/app/(marketing)/content";

export default function HomeStats() {
  return (
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
  );
}
