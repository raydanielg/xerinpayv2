import { Cta } from "@/components/landing/cta";
import { Developers } from "@/components/landing/developers";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Security } from "@/components/landing/security";
import { Stats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";
import { TrustBar } from "@/components/landing/trust-bar";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <Security />
      <Developers />
      <Stats />
      <Pricing />
      <Testimonials />
      <Faq />
      <Cta />
    </>
  );
}
