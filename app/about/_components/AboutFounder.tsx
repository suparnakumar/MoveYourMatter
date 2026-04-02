import Image from "next/image";
import Link from "next/link";
import { founder } from "../content";

export default function AboutFounder() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20 md:py-28">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-md">
            <Image
              src="/founder.jpg"
              alt="Suparna Kumar, founder of MoveYourMatter"
              width={600}
              height={800}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
          <div className="mt-6 w-full max-w-sm bg-teal-50 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-sm font-bold text-teal-800">{founder.credentials[0].title}</p>
              <p className="text-stone-500 text-sm mt-1">{founder.credentials[0].desc}</p>
            </div>
            <div className="border-t border-teal-100 pt-4">
              <p className="text-sm font-bold text-teal-800">{founder.credentials[1].title}</p>
              <p className="text-stone-500 text-sm mt-1">{founder.credentials[1].desc}</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">{founder.eyebrow}</p>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">{founder.heading}</h2>
          {founder.bio.map((para, i) => (
            <p key={i} className="text-stone-600 leading-relaxed mb-4">{para}</p>
          ))}
          <Link href={founder.cta.href} className="px-6 py-3 rounded-full bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors">
            {founder.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
