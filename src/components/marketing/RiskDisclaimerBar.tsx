import { useTranslation } from "react-i18next";

export function RiskDisclaimerBar() {
  const { t } = useTranslation();

  return (
    <div
      className="sticky top-0 z-[60] border-b border-border/80 bg-[#141212] px-4 py-2.5 text-center text-[11px] leading-relaxed text-muted sm:px-6 sm:text-xs"
      role="note"
    >
      <p>{t("capital.riskDisclaimer")}</p>
    </div>
  );
}
