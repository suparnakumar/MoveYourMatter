import Link from "next/link";

const posts = [
  {
    slug: "movement-and-neuroplasticity",
    title: "Why Movement Is the Most Underrated Brain Tool",
    date: "March 20, 2025",
    category: "Neuroscience",
    excerpt:
      "Most people think of exercise as a body thing. But the research tells a different story: complex, intentional movement is one of the most powerful drivers of neuroplasticity we have.",
  },
  {
    slug: "kathak-and-cognition",
    title: "What Kathak Taught Me About Focus",
    date: "March 5, 2025",
    category: "Personal",
    excerpt:
      "After decades of classical dance training, I started noticing something: my best coding sessions always followed a Kathak practice. Here's the science behind why.",
  },
  {
    slug: "micro-training-routines",
    title: "The 5-Minute Brain Reset That Actually Works",
    date: "February 18, 2025",
    category: "Practice",
    excerpt:
      "You don't need an hour to make a difference. A precisely designed 5-minute movement protocol can shift your cognitive state faster than a coffee break.",
  },
  {
    slug: "brain-fog-movement",
    title: "Brain Fog Is a Movement Problem",
    date: "February 3, 2025",
    category: "Wellness",
    excerpt:
      "Chronic brain fog is often treated as a sleep or nutrition issue. But one of its most overlooked causes — and cures — is a lack of intentional physical movement.",
  },
  {
    slug: "age-of-cognitive-overload",
    title: "We Are Living in the Age of Cognitive Overload",
    date: "January 22, 2025",
    category: "Perspective",
    excerpt:
      "Neuroscientists have a name for what we're all experiencing. And the antidote isn't a productivity app — it's your body.",
  },
  {
    slug: "rhythm-and-brain",
    title: "Rhythm Is a Cognitive Workout",
    date: "January 10, 2025",
    category: "Neuroscience",
    excerpt:
      "The act of following and generating rhythm engages a surprising number of brain regions simultaneously. Here's what that means for your mental performance.",
  },
];

const categoryColors: Record<string, string> = {
  Neuroscience: "bg-teal-100 text-teal-700",
  Personal: "bg-amber-100 text-amber-700",
  Practice: "bg-emerald-100 text-emerald-700",
  Wellness: "bg-rose-100 text-rose-700",
  Perspective: "bg-purple-100 text-purple-700",
};

export default function Blog() {
  const [featured, ...rest] = posts;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-900 to-teal-700 text-white py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">The Blog</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Insights on brain, body & movement.</h1>
          <p className="text-teal-100 text-xl leading-relaxed max-w-2xl mx-auto">
            Science, stories, and practical protocols for rewiring your brain through intentional movement.
          </p>
        </div>
      </section>

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

      {/* Newsletter CTA */}
      <section className="bg-teal-900 text-white py-16 md:py-24">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Never miss a post.</h2>
          <p className="text-teal-200 mb-8">Get new articles, movement protocols, and brain science insights delivered to your inbox.</p>
          <Link href="/signup" className="px-8 py-3 rounded-full bg-amber-400 text-teal-900 font-bold hover:bg-amber-300 transition-colors">
            Subscribe — It&apos;s Free
          </Link>
        </div>
      </section>
    </>
  );
}
