import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "@/components/marketing/Hero";
import {
  CapitalDecisionSection,
  CapitalPlatformsSection,
  CapitalPricingSection,
  PlatformStrip,
} from "@/components/marketing/CapitalSections";
import { MarketSummary } from "@/components/marketing/MarketSummary";
import { ServicesGrid } from "@/components/marketing/ServicesGrid";
import { MarketingTrustPillars } from "@/components/marketing/MarketingTrust";
import { FAQSection } from "@/components/marketing/FAQSection";
import { BackToTop } from "@/components/marketing/BackToTop";

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== "#markets") return;
    const scroll = () => document.getElementById("markets")?.scrollIntoView({ behavior: "smooth" });
    const frame = requestAnimationFrame(scroll);
    const t1 = window.setTimeout(scroll, 120);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
    };
  }, [location.pathname, location.hash, location.key]);

  return (
    <>
      <Hero />
      <PlatformStrip />
      <MarketSummary />
      <CapitalPlatformsSection />
      <CapitalPricingSection />
      <ServicesGrid />
      <CapitalDecisionSection />
      <MarketingTrustPillars />
      <FAQSection />
      <BackToTop />
    </>
  );
}
