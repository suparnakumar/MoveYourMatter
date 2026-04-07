// Shared check-in slider used across the practice player and onboarding flow.

export default function CheckinSlider({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-7">
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-medium text-stone-800">{label}</span>
        <span className="text-2xl font-bold text-teal-700">{value}</span>
      </div>
      <p className="text-stone-400 text-sm mb-3">{description}</p>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-700 h-2 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-stone-400 mt-1">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}
