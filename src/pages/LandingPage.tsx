import { HeroSection } from "@/components/HeroSection";
import { Pricing } from "@/components/Pricing";
import { TypingIntroSection } from "@/components/TypingIntroSection";

export const LandingPage = () => {
  return (
    <main>
      <HeroSection />
      <TypingIntroSection />
      <section className="container py-5 text-center">
        <h1 className="display-5 fw-bold mb-3">TypingHub</h1>
        <p className="text-muted lead">
          Improve your typing speed and accuracy for government exam preparation.
        </p>
      </section>
      <Pricing />
    </main>
  );
};
