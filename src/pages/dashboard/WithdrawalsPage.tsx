import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowDownToLine } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { useWithdrawalData } from "@/hooks/useWithdrawals";
import { FadeIn } from "@/components/motion/Motion";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ProductNotice } from "@/components/dashboard/ProductNotice";
import {
  WithdrawalBalanceBanner,
  WithdrawalHistoryPanel,
  OutstandingFeesPanel,
  PortfolioRequirementPanel,
} from "@/components/dashboard/WithdrawalUi";
import { WithdrawFundsShowcase } from "@/components/dashboard/WithdrawFundsShowcase";
import { WithdrawalHistory } from "@/components/dashboard/WithdrawalHistory";
import { DashboardSheet } from "@/components/dashboard/DashboardSheet";
import { KycRequiredGate } from "@/components/dashboard/KycRequiredGate";

export default function WithdrawalsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    withdrawals, balance, outstandingFees, portfolioStatus,
    hasPortfolioRequirementPending, canSubmitWithdrawal, load,
  } = useWithdrawalData();

  useEffect(() => {
    if (user) void load(user.id);
  }, [user, load]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow={t("dashboard.navGroupCash")}
        title={t("withdrawals.title")}
        subtitle={t("withdrawals.subtitle")}
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("dashboard.overview")}
            </Link>
          </Button>
        }
      />

      <KycRequiredGate>
        <DashboardSheet>
          <FadeIn className="space-y-5">
            <WithdrawalBalanceBanner balance={balance} />

            <ProductNotice
              title={t("withdrawals.howItWorksTitle")}
              body={t("withdrawals.howItWorksBody")}
            />
            <ProductNotice
              variant="risk"
              title={t("withdrawals.reviewTitle")}
              body={t("withdrawals.reviewBody")}
            />

            {user && (
              <>
                <OutstandingFeesPanel
                  fees={outstandingFees}
                  balance={balance}
                  onPaid={() => load(user.id)}
                />
                <PortfolioRequirementPanel status={portfolioStatus} />
              </>
            )}

            {canSubmitWithdrawal ? (
              <WithdrawFundsShowcase />
            ) : (
              user &&
              hasPortfolioRequirementPending && (
                <div className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-foreground">{t("withdrawals.portfolioWithdrawalsLockedTitle")}</p>
                  <p className="mt-2 text-xs text-muted">{t("withdrawals.portfolioBlockMessage")}</p>
                  <Button asChild size="sm" className="mt-4 rounded-full">
                    <Link to="/dashboard/deposits">
                      <ArrowDownToLine className="h-4 w-4" />
                      {t("withdrawals.portfolioDepositCta")}
                    </Link>
                  </Button>
                </div>
              )
            )}

            <WithdrawalHistoryPanel>
              <WithdrawalHistory withdrawals={withdrawals} />
            </WithdrawalHistoryPanel>

            <p className="pb-1 text-center text-xs text-muted">
              {t("withdrawals.needHelp")}{" "}
              <Link to="/dashboard/support" className="font-medium text-foreground hover:text-emerald">
                {t("withdrawals.contactSupport")}
              </Link>
            </p>
          </FadeIn>
        </DashboardSheet>
      </KycRequiredGate>
    </div>
  );
}
