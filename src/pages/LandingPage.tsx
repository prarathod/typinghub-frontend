import { HeroSection } from "@/components/HeroSection";
import { Pricing } from "@/components/Pricing";
import { TypingOptionsSection } from "@/components/TypingOptionsSection";

export const LandingPage = () => {
  return (
    <main>
      <HeroSection />
      <TypingOptionsSection />
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
