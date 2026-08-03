import { lazy, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "@/components/marketing/Hero";
import { PlatformStrip } from "@/components/marketing/CapitalSections";
import { LazySection } from "@/components/ui/lazy-section";

const MarketSummary = lazy(() =>
  import("@/components/marketing/MarketSummary").then((m) => ({ default: m.MarketSummary }))
);
const CapitalPlatformsSection = lazy(() =>
  import("@/components/marketing/CapitalSections").then((m) => ({ default: m.CapitalPlatformsSection }))
);
const CapitalPricingSection = lazy(() =>
  import("@/components/marketing/CapitalSections").then((m) => ({ default: m.CapitalPricingSection }))
);
const ServicesGrid = lazy(() =>
  import("@/components/marketing/ServicesGrid").then((m) => ({ default: m.ServicesGrid }))
);
const CapitalDecisionSection = lazy(() =>
  import("@/components/marketing/CapitalSections").then((m) => ({ default: m.CapitalDecisionSection }))
);
const MarketingTrustPillars = lazy(() =>
  import("@/components/marketing/MarketingTrust").then((m) => ({ default: m.MarketingTrustPillars }))
);
const FAQSection = lazy(() =>
  import("@/components/marketing/FAQSection").then((m) => ({ default: m.FAQSection }))
);
const BackToTop = lazy(() =>
  import("@/components/marketing/BackToTop").then((m) => ({ default: m.BackToTop }))
);

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
      <LazySection minHeight={420}>
        <MarketSummary />
      </LazySection>
      <LazySection minHeight={360}>
        <CapitalPlatformsSection />
      </LazySection>
      <LazySection minHeight={320}>
        <CapitalPricingSection />
      </LazySection>
      <LazySection minHeight={360}>
        <ServicesGrid />
      </LazySection>
      <LazySection minHeight={280}>
        <CapitalDecisionSection />
      </LazySection>
      <LazySection minHeight={280}>
        <MarketingTrustPillars />
      </LazySection>
      <LazySection minHeight={240}>
        <FAQSection />
      </LazySection>
      <LazySection minHeight={0}>
        <BackToTop />
      </LazySection>
    </>
  );
}
