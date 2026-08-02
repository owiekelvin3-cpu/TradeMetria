import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { RiskDisclaimerBar } from "@/components/marketing/RiskDisclaimerBar";
import { AnimatedBackground } from "@/components/marketing/AnimatedBackground";
import { PageEnter } from "@/components/motion/Motion";

export function MarketingLayout() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen min-h-dvh overflow-x-clip bg-void [--risk-bar-height:2.625rem] sm:[--risk-bar-height:2.375rem]">
      <AnimatedBackground />
      <RiskDisclaimerBar />
      <Header />
      <main className="relative pt-[calc(var(--risk-bar-height)+3.5rem+env(safe-area-inset-top))] sm:pt-[calc(var(--risk-bar-height)+4rem+env(safe-area-inset-top))]">
        <PageEnter key={location.pathname}>
          <Outlet />
        </PageEnter>
      </main>
      <Footer />
    </div>
  );
}
