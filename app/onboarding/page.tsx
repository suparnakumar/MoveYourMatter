import Link from "next/link";

// Screen 1: The promise — no sign-up, just start
export default function OnboardingStart() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-teal-700 text-sm font-medium tracking-widest uppercase mb-6">
          MoveYourMatter
        </p>
        <h1 className="text-4xl font-semibold text-stone-900 leading-tight mb-4">
          Feel sharper<br />in 7 minutes.
        </h1>
        <p className="text-stone-500 text-lg max-w-xs">
          A daily cognitive habit system through movement.
        </p>
      </div>

      <div className="px-6 pb-12">
        <Link
          href="/onboarding/checkin"
          className="block w-full py-4 rounded-2xl bg-teal-700 text-white text-center font-semibold text-lg hover:bg-teal-800 transition-colors"
        >
          Start your first practice
        </Link>
        <p className="text-center text-stone-400 text-sm mt-4">
          No sign-up required
        </p>
      </div>
    </div>
  );
}
