export const page = {
  eyebrow: "Begin",
  heading: "Start the practice.",
  subheading: "Free to join. No prior experience needed. We will never sell you something that doesn't genuinely serve your growth.",
  submitLabel: "Join MoveYourMatter",
  disclaimer: "No spam. No upsells. Just the practice.",
};

export const goals = [
  { value: "focus", label: "Build a more consistent attention practice" },
  { value: "fog", label: "Work through mental fog and fatigue" },
  { value: "resilience", label: "Develop long-term mental resilience" },
  { value: "creativity", label: "Open up creative thinking" },
  { value: "kathak", label: "Learn more about Kathak and its roots" },
];

export const socialProof = [
  { value: "Free", label: "Always" },
  { value: "500+", label: "In the practice" },
  { value: "90 days", label: "For real change" },
];

export const success = {
  icon: "🙏",
  heading: "Welcome.",
  body: (firstName: string) =>
    `${firstName}, you're in. Check your inbox — your first session and a note on what to expect are on their way.`,
  cta: { label: "Explore Programs", href: "/programs" },
};
