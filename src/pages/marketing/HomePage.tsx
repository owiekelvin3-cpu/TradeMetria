import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MarketTicker } from "@/components/marketing/MarketTicker";
import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { MarketSummary } from "@/components/marketing/MarketSummary";
import { GlobalInflationMap } from "@/components/marketing/GlobalInflationMap";
import { ProductShowcase } from "@/components/marketing/ProductShowcase";
import { ServicesGrid } from "@/components/marketing/ServicesGrid";
import { InsightsRail } from "@/components/marketing/InsightsRail";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { CommunityLatestNews } from "@/components/marketing/CommunityLatestNews";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { MarketingTrustPillars } from "@/components/marketing/MarketingTrust";
import { FAQSection } from "@/components/marketing/FAQSection";
import { BackToTop } from "@/components/marketing/BackToTop";

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== "#markets" && location.hash !== "#economy" && location.hash !== "#community-news") {
      return;
    }
    const id = location.hash.slice(1);
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    const frame = requestAnimationFrame(scroll);
    const t1 = window.setTimeout(scroll, 120);
    const t2 = window.setTimeout(scroll, 400);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [location.pathname, location.hash, location.key]);

  return (
    <>
      <Hero />
      <TrustBar />
      <MarketTicker />
      <CommunityLatestNews />
      <MarketSummary />
      <GlobalInflationMap />
      <ProductShowcase />
      <ServicesGrid />
      <InsightsRail />
      <HowItWorks />
      <TestimonialsSection />
      <MarketingTrustPillars />
      <FAQSection />
      <BackToTop />
    </>
  );
}
