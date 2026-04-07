import HeroSection from "@/components/HeroSection";
import { hero } from "../content";

export default function ProgramsHero() {
  return <HeroSection eyebrow={hero.eyebrow} heading={hero.heading} subheading={hero.subheading} />;
}
