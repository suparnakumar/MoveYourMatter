import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/posts";
import { categoryColors } from "../content";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) return {};
  return { title: `${post.title} — MoveYourMatter`, description: post.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) notFound();

  return (
    <article className="max-w-2xl mx-auto px-6 py-20 md:py-28">
      {/* Back */}
      <Link href="/blog" className="text-sm text-teal-700 font-semibold hover:underline mb-10 block">
        &larr; All posts
      </Link>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 mb-6">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[post.category] ?? "bg-stone-100 text-stone-600"}`}>
          {post.category}
        </span>
        <span className="text-xs text-stone-400">{post.date}</span>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">{post.title}</h1>
      <p className="text-stone-500 text-xl leading-relaxed mb-12 border-b border-stone-100 pb-12">{post.excerpt}</p>

      {/* Body */}
      <div
        className="prose prose-stone prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-stone-900
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-p:text-stone-600 prose-p:leading-relaxed
          prose-li:text-stone-600
          prose-strong:text-stone-900
          prose-a:text-teal-700 prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* Footer CTA */}
      <div className="mt-16 pt-10 border-t border-stone-100 text-center">
        <p className="text-stone-500 mb-6">Ready to feel the difference?</p>
        <Link href="/signup" className="px-8 py-3 rounded-full bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors">
          Start the Practice
        </Link>
      </div>
    </article>
  );
}
