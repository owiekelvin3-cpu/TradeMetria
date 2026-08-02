import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DashboardSheet } from "@/components/dashboard/DashboardSheet";
import { PortfolioRequirementPanel } from "@/components/dashboard/WithdrawalUi";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/Motion";
import {
  portfolioProgressPercent,
  isPortfolioRequirementBlocking,
} from "@/lib/portfolio-requirement";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Bot,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "@/lib/icons";

function AnimatedMetric({
  label,
  value,
  sub,
  icon: Icon,
  href,
  accent,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Wallet;
  href?: string;
  accent?: "emerald" | "sky" | "gold" | "neutral";
  delay?: number;
}) {
  const accentMap = {
    emerald: "border-emerald/20 bg-emerald/[0.06] text-emerald",
    sky: "border-sky-500/20 bg-sky-500/[0.06] text-sky-400",
    gold: "border-gold/20 bg-gold/[0.06] text-gold",
    neutral: "border-border bg-secondary/30 text-muted",
  };

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="dashboard-stat group h-full"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            accentMap[accent ?? "neutral"]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {href && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted opacity-0 transition-opacity group-hover:opacity-100">
            →
          </span>
        )}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </motion.div>
  );

  if (href) {
    return (
      <Link to={href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}

function AllocationBar({
  depositShare,
  profitShare,
}: {
  depositShare: number;
  profitShare: number;
}) {
  const { t } = useTranslation();

  return (
    <FadeIn className="rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6">
      <h3 className="font-display text-base font-semibold text-foreground">{t("portfolio.allocationTitle")}</h3>
      <p className="mt-1 text-sm text-muted">{t("portfolio.allocationDesc")}</p>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-secondary/60">
        <div className="flex h-full">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${depositShare}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-gradient-to-r from-sky-500/80 to-sky-400/60"
          />
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${profitShare}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-gradient-to-r from-emerald/80 to-emerald-soft/70"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
          <span className="text-muted">{t("portfolio.depositedCapital")}</span>
          <span className="ml-auto font-semibold text-foreground">{depositShare}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald" />
          <span className="text-muted">{t("portfolio.tradingProfit")}</span>
          <span className="ml-auto font-semibold text-foreground">{profitShare}%</span>
        </div>
      </div>
    </FadeIn>
  );
}

export default function PortfolioPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, allocation, loading, refreshing, error, load } = usePortfolio(user?.id);

  useEffect(() => {
    void load();
  }, [load]);

  const portfolioStatus = data?.portfolioStatus;
  const requirementBlocking = portfolioStatus ? isPortfolioRequirementBlocking(portfolioStatus) : false;
  const requirementProgress = portfolioStatus ? portfolioProgressPercent(portfolioStatus) : 100;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow={t("dashboard.navGroupTrade")}
        title={t("portfolio.title")}
        subtitle={t("portfolio.subtitle")}
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={() => void load(true)}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            {t("portfolio.refresh")}
          </Button>
        }
      />

      {error && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <FadeIn>
        <section className="dashboard-hero overflow-hidden px-5 py-6 sm:rounded-[1.75rem] sm:px-8 sm:py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  {t("portfolio.totalValue")}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald/30 bg-emerald/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-50 motion-reduce:animate-none" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald" />
                  </span>
                  {t("portfolio.live")}
                </span>
              </div>

              {loading ? (
                <div className="mt-4 h-14 w-56 animate-pulse rounded-2xl bg-white/10" />
              ) : (
                <motion.p
                  key={data?.balance}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl"
                >
                  {formatCurrency(data?.balance ?? 0)}
                </motion.p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild size="sm" className="rounded-full bg-white text-void hover:bg-white/90">
                  <Link to="/dashboard/deposits">
                    <ArrowDownToLine className="h-4 w-4" />
                    {t("portfolio.addFunds")}
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10">
                  <Link to="/dashboard/trading-room">
                    <TrendingUp className="h-4 w-4" />
                    {t("portfolio.trade")}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="h-[140px] min-h-[120px] rounded-2xl border border-white/10 bg-black/20 p-2 sm:h-[160px]">
              {loading ? (
                <div className="h-full animate-pulse rounded-xl bg-white/5" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.chartData ?? []}>
                    <defs>
                      <linearGradient id="portfolio-chart-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbe5b" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#fbbe5b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" hide />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{
                        background: "#111113",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(v) => [formatCurrency(Number(v ?? 0)), t("portfolio.value")]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#ffc764"
                      strokeWidth={2}
                      fill="url(#portfolio-chart-fill)"
                      isAnimationActive
                      animationDuration={1200}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>
      </FadeIn>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnimatedMetric
          label={t("portfolio.totalDeposits")}
          value={formatCurrency(data?.totalDeposits ?? 0)}
          sub={t("portfolio.settledOnly")}
          icon={ArrowDownToLine}
          href="/dashboard/deposits"
          accent="sky"
          delay={0.05}
        />
        <AnimatedMetric
          label={t("portfolio.tradingProfit")}
          value={formatCurrency(data?.tradingProfit ?? 0)}
          sub={
            data && data.netContributions > 0
              ? t("portfolio.profitPct", { pct: data.profitPercent.toFixed(1) })
              : undefined
          }
          icon={BarChart3}
          href="/dashboard/trades"
          accent={data && data.tradingProfit >= 0 ? "emerald" : "neutral"}
          delay={0.1}
        />
        <AnimatedMetric
          label={t("portfolio.totalWithdrawals")}
          value={formatCurrency(data?.totalWithdrawals ?? 0)}
          icon={ArrowUpFromLine}
          href="/dashboard/withdrawals"
          accent="gold"
          delay={0.15}
        />
        <AnimatedMetric
          label={t("portfolio.activeBots")}
          value={String((data?.activeTrades ?? 0) + (data?.activeAiBots ?? 0))}
          sub={t("portfolio.activeBotsSub", {
            trades: data?.activeTrades ?? 0,
            bots: data?.activeAiBots ?? 0,
          })}
          icon={Bot}
          href="/dashboard/ai-trading"
          accent="emerald"
          delay={0.2}
        />
      </div>

      {portfolioStatus?.enabled && (
        <FadeIn delay={0.1}>
          <div className="grid gap-4 lg:grid-cols-[1fr_minmax(240px,280px)]">
            <PortfolioRequirementPanel status={portfolioStatus} />
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/50 p-6">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-secondary/80" />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className={requirementBlocking ? "text-sky-400" : "text-emerald"}
                    strokeDasharray={326.7}
                    initial={{ strokeDashoffset: 326.7 }}
                    animate={{ strokeDashoffset: 326.7 - (326.7 * requirementProgress) / 100 }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-display text-2xl font-bold text-foreground">{requirementProgress}%</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted">{t("portfolio.requirement")}</span>
                </div>
              </div>
              <p className="mt-4 text-center text-xs leading-relaxed text-muted">
                {requirementBlocking
                  ? t("portfolio.requirementPending", {
                      amount: formatCurrency(portfolioStatus.remaining),
                    })
                  : t("portfolio.requirementMet")}
              </p>
            </div>
          </div>
        </FadeIn>
      )}

      <AllocationBar depositShare={allocation.depositShare} profitShare={allocation.profitShare} />

      <DashboardSheet>
        <FadeIn>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">{t("portfolio.recentDeposits")}</h2>
              <p className="text-sm text-muted">{t("portfolio.recentDepositsDesc")}</p>
            </div>
            <Link to="/dashboard/transactions" className="text-sm font-semibold text-emerald hover:underline">
              {t("portfolio.viewAll")}
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-secondary/40" />
              ))}
            </div>
          ) : (data?.deposits.length ?? 0) === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted">
              {t("dashboard.noDeposits")}
            </p>
          ) : (
            <StaggerContainer className="space-y-2">
              {[...(data?.deposits ?? [])].reverse().slice(0, 6).map((dep) => (
                <StaggerItem key={dep.id}>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-secondary/20 px-4 py-3 transition-colors hover:bg-secondary/40">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                        <Wallet className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{dep.method}</p>
                        <p className="text-xs text-muted">{formatDate(dep.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-foreground">
                        {formatCurrency(Number(dep.amount))}
                      </p>
                      <p
                        className={cn(
                          "text-[11px] font-medium capitalize",
                          dep.status === "completed" || dep.status === "approved"
                            ? "text-emerald"
                            : dep.status === "pending"
                              ? "text-gold"
                              : "text-muted"
                        )}
                      >
                        {dep.status}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </FadeIn>
      </DashboardSheet>
    </div>
  );
}
