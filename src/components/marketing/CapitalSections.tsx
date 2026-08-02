import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, LayoutDashboard, Server, LineChart, Bot, Radio } from "@/lib/icons";
import { FadeIn } from "@/components/motion/Motion";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { icon: LayoutDashboard, labelKey: "capital.platformWeb" },
  { icon: Server, labelKey: "capital.platformMobile" },
  { icon: LineChart, labelKey: "capital.platformRoom" },
  { icon: Bot, labelKey: "capital.platformAi" },
  { icon: Radio, labelKey: "capital.platformSignals" },
] as const;

export function PlatformStrip() {
  const { t } = useTranslation();

  return (
    <div className="border-b border-border/70 bg-charcoal">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-5 md:gap-x-10 md:py-6">
          {PLATFORMS.map(({ icon: Icon, labelKey }) => (
            <span
              key={labelKey}
              className="inline-flex items-center gap-2 text-xs font-medium text-muted sm:text-sm"
            >
              <Icon className="h-4 w-4 text-foreground/70" aria-hidden="true" />
              {t(labelKey)}
            </span>
          ))}
        </div>
      </Container>
    </div>
  );
}

export function CapitalPlatformsSection() {
  const { t } = useTranslation();

  const cards = [
    {
      titleKey: "capital.platformCardWebTitle",
      descKey: "capital.platformCardWebDesc",
      href: "/trading-room",
    },
    {
      titleKey: "capital.platformCardMobileTitle",
      descKey: "capital.platformCardMobileDesc",
      href: "/auth?mode=register",
    },
    {
      titleKey: "capital.platformCardDeskTitle",
      descKey: "capital.platformCardDeskDesc",
      href: "/dashboard/support",
    },
  ] as const;

  return (
    <Section className="border-t border-border bg-void py-16 md:py-24">
      <Container>
        <FadeIn className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl md:leading-[1.08]">
            {t("capital.platformsTitle1")}
            <br />
            {t("capital.platformsTitle2")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            {t("capital.platformsSubtitle")}
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {cards.map((card, i) => (
            <FadeIn key={card.titleKey} delay={i * 0.06}>
              <Link
                to={card.href}
                className="group flex h-full flex-col rounded-2xl border border-border/80 bg-charcoal p-6 transition-colors hover:border-emerald/30"
              >
                <h3 className="font-display text-lg font-semibold text-foreground">{t(card.titleKey)}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{t(card.descKey)}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald">
                  {t("capital.learnMore")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function CapitalPricingSection() {
  const { t } = useTranslation();

  const items = [
    { titleKey: "capital.pricingSpreadTitle", descKey: "capital.pricingSpreadDesc" },
    { titleKey: "capital.pricingFeesTitle", descKey: "capital.pricingFeesDesc" },
  ] as const;

  return (
    <Section className="border-t border-border bg-charcoal py-16 md:py-24">
      <Container>
        <FadeIn className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl md:leading-[1.08]">
            {t("capital.pricingTitle")}
          </h2>
        </FadeIn>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {items.map((item, i) => (
            <FadeIn key={item.titleKey} delay={i * 0.08}>
              <div className="rounded-2xl border border-border/70 bg-void/60 p-6 md:p-8">
                <h3 className="font-display text-xl font-semibold text-foreground">{t(item.titleKey)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{t(item.descKey)}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.12} className="mt-8 text-center">
          <p className="text-sm text-muted">{t("capital.pricingFootnote")}</p>
        </FadeIn>
      </Container>
    </Section>
  );
}

export function CapitalDecisionSection() {
  const { t } = useTranslation();

  const steps = [
    { titleKey: "capital.decisionStep1Title", descKey: "capital.decisionStep1Desc" },
    { titleKey: "capital.decisionStep2Title", descKey: "capital.decisionStep2Desc" },
    { titleKey: "capital.decisionStep3Title", descKey: "capital.decisionStep3Desc" },
  ] as const;

  return (
    <Section className="border-t border-border py-16 md:py-24">
      <Container>
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald">{t("capital.decisionEyebrow")}</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl md:leading-[1.08]">
            {t("capital.decisionTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            {t("capital.decisionSubtitle")}
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <FadeIn key={step.titleKey} delay={i * 0.07}>
              <div className="h-full rounded-2xl border border-border/70 bg-charcoal p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{t(step.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(step.descKey)}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.15} className="mt-10 flex justify-center">
          <Button asChild size="lg">
            <Link to="/auth?mode=register">{t("capital.openAccount")}</Link>
          </Button>
        </FadeIn>
      </Container>
    </Section>
  );
}

export function CapitalPageCta({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <Section className={cn("border-t border-border bg-charcoal py-14 md:py-20", className)}>
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h2>
          {subtitle && <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{subtitle}</p>}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/auth?mode=register">{t("capital.openAccount")}</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/auth">{t("capital.logIn")}</Link>
            </Button>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
