"use client";

export default function Greeting({ name }: { name: string }) {
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <p className="text-stone-400 text-sm">{greeting},</p>
      <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 capitalize">{name}</h1>
    </div>
  );
}
