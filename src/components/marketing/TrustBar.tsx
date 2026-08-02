import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BRAND } from "@/constants/brand";
import { Container } from "@/components/ui/section";

export function TrustBar() {
  const { t } = useTranslation();

  return (
    <div className="border-y border-border bg-secondary/15 py-4 md:py-5">
      <Container>
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
      </Container>
    </div>
  );
}
