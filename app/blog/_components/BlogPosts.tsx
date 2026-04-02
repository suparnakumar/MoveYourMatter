import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { categoryColors } from "../content";

export default function BlogPosts() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
      {/* Featured Post */}
      <div className="mb-16">
        <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-6">Featured</p>
        <div className="border border-stone-200 rounded-3xl p-8 md:p-12 hover:border-teal-300 hover:shadow-lg transition-all">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[featured.category] ?? "bg-stone-100 text-stone-600"}`}>
              {featured.category}
            </span>
            <span className="text-xs text-stone-400">{featured.date}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 hover:text-teal-700 transition-colors">
            <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
          </h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-6">{featured.excerpt}</p>
          <Link href={`/blog/${featured.slug}`} className="text-teal-700 font-semibold hover:underline">
            Read more &rarr;
          </Link>
        </div>
      </div>

      {/* Post Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {rest.map(({ slug, title, date, category, excerpt }) => (
          <div key={slug} className="border border-stone-200 rounded-2xl p-8 hover:border-teal-300 hover:shadow-md transition-all">
            <div className="flex flex-wrap gap-3 mb-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[category] ?? "bg-stone-100 text-stone-600"}`}>
                {category}
              </span>
              <span className="text-xs text-stone-400">{date}</span>
            </div>
            <h3 className="text-xl font-bold mb-3 hover:text-teal-700 transition-colors">
              <Link href={`/blog/${slug}`}>{title}</Link>
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed mb-4">{excerpt}</p>
            <Link href={`/blog/${slug}`} className="text-teal-700 text-sm font-semibold hover:underline">
              Read more &rarr;
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
