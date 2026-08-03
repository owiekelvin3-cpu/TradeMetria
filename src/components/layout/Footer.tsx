import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BRAND } from "@/constants/brand";
import { Logo } from "@/components/brand/Logo";
import { FadeIn } from "@/components/motion/Motion";
import { Container } from "@/components/ui/section";

export function Footer() {
  const { t } = useTranslation();

  const footerSections = [
    {
      titleKey: "footer.platform",
      links: [
        { href: "/#markets", labelKey: "nav.markets" },
        { href: "/services", labelKey: "nav.services" },
        { href: "/trading-signals", labelKey: "footer.tradingSignals" },
        { href: "/trading-room", labelKey: "footer.tradingRoom" },
        { href: "/brokers", labelKey: "footer.brokers" },
      ],
    },
    {
      titleKey: "footer.company",
      links: [
        { href: "/about", labelKey: "footer.aboutUs" },
        { href: "/reviews", labelKey: "footer.testimonials" },
        { href: "/payouts", labelKey: "footer.payouts" },
        { href: "/faqs", labelKey: "footer.faq" },
      ],
    },
    {
      titleKey: "footer.trust",
      links: [
        { href: "/security", labelKey: "nav.security" },
        { href: "/holdings", labelKey: "footer.holdings" },
        { href: "/verify", labelKey: "footer.verifyCertificate" },
      ],
    },
    {
      titleKey: "footer.legal",
      links: [
        { href: "/privacy", labelKey: "footer.privacy" },
        { href: "/terms", labelKey: "footer.terms" },
        { href: "/cookies", labelKey: "footer.cookies" },
      ],
    },
  ] as const;

  const mobileLegal = [
    { href: "/privacy", labelKey: "footer.privacy" },
    { href: "/terms", labelKey: "footer.terms" },
    { href: "/security", labelKey: "nav.security" },
    { href: "/faqs", labelKey: "footer.faq" },
  ] as const;

  return (
    <footer className="relative mt-8 border-t border-border bg-charcoal pb-[max(2rem,env(safe-area-inset-bottom))] pt-12 sm:mt-12 sm:pt-16">
      <Container>
        <FadeIn className="mb-10 border-b border-border/70 pb-8 text-center sm:mb-12">
          <p className="text-sm text-muted">{t("capital.footerContact")}</p>
          <a
            href={`mailto:${BRAND.supportEmail}`}
            className="mt-2 inline-block text-sm font-semibold text-foreground hover:text-emerald"
          >
            {BRAND.supportEmail}
          </a>
        </FadeIn>

        <div className="grid gap-8 sm:gap-12 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link to="/" className="group inline-flex transition-opacity hover:opacity-90">
              <Logo size="lg" wordmarkClassName="text-lg" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted sm:mt-5">{BRAND.tagline}</p>
            <p className="mt-4 text-xs leading-relaxed text-muted sm:mt-5">
              {t("marketingTrust.registrationNote", {
                id: BRAND.registrationNumber,
                entity: BRAND.legalEntity,
              })}
            </p>

            <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-2 sm:hidden" aria-label={t("footer.legal")}>
              {mobileLegal.map((link) => (
                <Link key={link.href} to={link.href} className="text-xs font-medium text-muted hover:text-emerald">
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          {footerSections.map((section) => (
            <div key={section.titleKey} className="hidden sm:block">
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                {t(section.titleKey)}
              </h4>
              <ul className="space-y-3.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-muted transition-colors hover:text-foreground">
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-8 sm:mt-12">
          <p className="text-center text-xs text-muted md:text-left">
            &copy; {BRAND.foundedYear}&ndash;{new Date().getFullYear()} {BRAND.legalEntity}. {t("common.allRightsReserved")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
