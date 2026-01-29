import { HeroSection } from "@/components/HeroSection";
import { Pricing } from "@/components/Pricing";
import { TypingIntroSection } from "@/components/TypingIntroSection";

export const LandingPage = () => {
  return (
    <main>
      <HeroSection />
      <TypingIntroSection />
      <Pricing />
    </main>
  );
};
