import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BRAND } from "@/constants/brand";
import { Shield, Lock, FileCheck, Mail } from "@/lib/icons";
import { FadeIn } from "@/components/motion/Motion";
import { Container } from "@/components/ui/section";
import { cn } from "@/lib/utils";

const pillars = [
  { icon: Shield, titleKey: "marketingTrust.pillarCustody", descKey: "marketingTrust.pillarCustodyDesc" },
  { icon: Lock, titleKey: "marketingTrust.pillarSecurity", descKey: "marketingTrust.pillarSecurityDesc" },
  { icon: FileCheck, titleKey: "marketingTrust.pillarTransparency", descKey: "marketingTrust.pillarTransparencyDesc" },
  { icon: Mail, titleKey: "marketingTrust.pillarSupport", descKey: "marketingTrust.pillarSupportDesc" },
] as const;

export function MarketingTrustBand({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <section className={cn("border-y border-border bg-secondary/15 py-4 md:py-5", className)}>
      <Container>
        <FadeIn>
          <div className="flex flex-col items-center justify-between gap-3 text-center text-xs text-muted sm:flex-row sm:text-left md:text-sm">
            <p>
              {t("marketingTrust.registrationNote", {
                id: BRAND.registrationNumber,
                entity: BRAND.legalEntity,
              })}
            </p>
            <nav
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
              aria-label={t("trustBar.linksLabel")}
            >
              <Link to="/security" className="font-medium text-foreground/80 transition-colors hover:text-emerald">
                {t("nav.security")}
              </Link>
              <Link to="/verify" className="font-medium text-foreground/80 transition-colors hover:text-emerald">
                {t("footer.verifyCertificate")}
              </Link>
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="font-medium text-foreground/80 transition-colors hover:text-emerald"
              >
                {t("trustBar.contactDesk")}
              </a>
            </nav>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}

export function MarketingTrustPillars({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <section className={cn("py-14 md:py-20", className)}>
      <Container>
        <FadeIn className="mb-8 max-w-2xl">
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            {t("marketingTrust.pillarsTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted md:text-base">{t("marketingTrust.pillarsSub")}</p>
        </FadeIn>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div key={p.titleKey} className="rounded-2xl border border-border p-5">
              <p.icon className="mb-3 h-5 w-5 text-emerald" aria-hidden="true" />
              <h3 className="font-semibold text-foreground">{t(p.titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(p.descKey)}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">
          {t("marketingTrust.learnSecurity")}{" "}
          <Link to="/security" className="font-semibold text-emerald hover:underline">
            {t("nav.security")}
          </Link>
          {" · "}
          <Link to="/verify" className="font-semibold text-emerald hover:underline">
            {t("footer.verifyCertificate")}
          </Link>
        </p>
      </Container>
    </section>
  );
}

export function MarketingFaqBlock({
  titleKey,
  items,
}: {
  titleKey: string;
  items: { q: string; a: string }[];
}) {
  const { t } = useTranslation();

  return (
    <section className="border-t border-border py-14 md:py-20">
      <Container>
        <FadeIn className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{t(titleKey)}</h2>
          <div className="mt-8 space-y-6">
            {items.map((item) => (
              <div key={item.q} className="border-b border-border/70 pb-6 last:border-0">
                <h3 className="text-base font-semibold text-foreground">{t(item.q)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(item.a)}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
