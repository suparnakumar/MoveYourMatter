import Link from "next/link";
import { newsletterCta } from "../content";

export default function BlogNewsletterCTA() {
  return (
    <section className="bg-teal-900 text-white py-16 md:py-24">
      <div className="max-w-xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">{newsletterCta.heading}</h2>
        <p className="text-teal-200 mb-8">{newsletterCta.body}</p>
        <Link href={newsletterCta.href} className="px-8 py-3 rounded-full bg-amber-400 text-teal-900 font-bold hover:bg-amber-300 transition-colors">
          {newsletterCta.label}
        </Link>
      </div>
    </section>
  );
}
