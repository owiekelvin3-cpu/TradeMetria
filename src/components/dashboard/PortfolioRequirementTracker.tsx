import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowDownToLine, CheckCircle, Wallet } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import {
  portfolioProgressPercent,
  type PortfolioRequirementStatus,
} from "@/lib/portfolio-requirement";

export function PortfolioRequirementTracker({
  status,
  pendingDeposits = 0,
  formatAmount = formatCurrency,
}: {
  status: PortfolioRequirementStatus;
  pendingDeposits?: number;
  formatAmount?: (amount: number) => string;
}) {
  const { t } = useTranslation();

  if (!status.enabled || status.waived) return null;

  const progress = portfolioProgressPercent(status);
  const met = status.can_withdraw;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[1.75rem] border p-5 sm:p-6",
        met
          ? "border-emerald/30 bg-gradient-to-br from-emerald/[0.12] via-emerald/[0.04] to-transparent"
          : "border-sky-500/25 bg-gradient-to-br from-sky-500/[0.10] via-sky-500/[0.03] to-transparent"
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                met ? "bg-emerald/15 text-emerald" : "bg-sky-500/15 text-sky-400"
              )}
            >
              {met ? <CheckCircle className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                {t("portfolio.requirementEyebrow")}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {met ? t("portfolio.requirementMetTitle") : t("portfolio.requirementBuildTitle")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                {met
                  ? t("portfolio.requirementMet")
                  : t("portfolio.requirementPercentComplete", { percent: progress })}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card/50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                {t("portfolio.requirementDeposited")}
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                {formatAmount(status.deposit_total)}
              </p>
              <p className="mt-1 text-xs text-muted">{t("portfolio.settledOnly")}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                {t("portfolio.requirementTarget")}
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                {formatAmount(status.requirement)}
              </p>
              <p className="mt-1 text-xs text-muted">{t("portfolio.requirementAdminSet")}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                {met ? t("portfolio.requirementStatus") : t("portfolio.requirementRemainingLabel")}
              </p>
              <p
                className={cn(
                  "mt-1 font-display text-2xl font-semibold",
                  met ? "text-emerald" : "text-sky-400"
                )}
              >
                {met ? t("portfolio.requirementUnlocked") : formatAmount(status.remaining)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {met ? t("portfolio.requirementMet") : t("portfolio.requirementToWithdraw")}
              </p>
            </div>
          </div>

          {pendingDeposits > 0 && (
            <p className="mt-4 rounded-xl border border-gold/20 bg-gold/[0.06] px-3 py-2 text-xs text-gold">
              {t("portfolio.pendingDepositsNote", { amount: formatAmount(pendingDeposits) })}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/40 p-5 lg:w-[220px]">
          <div className="relative h-36 w-36">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-secondary/80"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                className={met ? "text-emerald" : "text-sky-400"}
                strokeDasharray={326.7}
                initial={{ strokeDashoffset: 326.7 }}
                animate={{ strokeDashoffset: 326.7 - (326.7 * progress) / 100 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <motion.span
                key={progress}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-display text-3xl font-bold text-foreground"
              >
                {progress}%
              </motion.span>
              <span className="text-[10px] uppercase tracking-wider text-muted">
                {met ? t("portfolio.requirementComplete") : t("portfolio.requirementTowardUnlock")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-muted">{t("portfolio.requirementProgressLabel")}</span>
          <span className="font-semibold text-foreground">
            {t("portfolio.requirementProgressAmounts", {
              deposited: formatAmount(status.deposit_total),
              required: formatAmount(status.requirement),
            })}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-secondary/80">
          <motion.div
            className={cn(
              "h-full rounded-full",
              met ? "bg-gradient-to-r from-emerald to-emerald-soft" : "bg-gradient-to-r from-sky-500 to-sky-400"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">{t("portfolio.requirementProfitNote")}</p>
      </div>

      {!met && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">{t("portfolio.requirementPending", { amount: formatAmount(status.remaining) })}</p>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/dashboard/deposits">
              <ArrowDownToLine className="h-4 w-4" />
              {t("portfolio.requirementDepositCta")}
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
