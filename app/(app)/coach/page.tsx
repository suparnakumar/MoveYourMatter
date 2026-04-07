import CoachChat from "./CoachChat";

export default function CoachPage() {
  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Your coach</h1>
        <p className="text-stone-400 text-sm mt-0.5">Ask anything about your practice, the rasa, or your brain.</p>
      </div>
      <CoachChat />
    </div>
  );
}
