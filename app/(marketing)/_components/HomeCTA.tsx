import Link from "next/link";
import { cta } from "@/app/(marketing)/content";

export default function HomeCTA() {
  return (
    <section className="bg-teal-900 text-white py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">{cta.heading}</h2>
        <p className="text-teal-200 text-xl mb-10 leading-relaxed italic">{cta.body}</p>
        <Link href={cta.href} className="px-10 py-4 rounded-full bg-amber-400 text-teal-900 font-bold text-lg hover:bg-amber-300 transition-colors">
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
