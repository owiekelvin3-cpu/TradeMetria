import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowRight, TrendingDown, TrendingUp } from "@/lib/icons";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/Motion";
import { Container } from "@/components/ui/section";
import {
  MARKET_CRYPTO_GAINERS,
  MARKET_CRYPTO_LOSERS,
  MARKET_CRYPTO_RANKING,
  MARKET_ENERGY,
  MARKET_FEATURED_CRYPTO,
  MARKET_FEATURED_FOREX,
  MARKET_FEATURED_FUTURES,
  MARKET_FEATURED_INDICES,
  MARKET_FEATURED_STOCKS,
  MARKET_FOREX_MAJORS,
  MARKET_GAINERS,
  MARKET_HIGH_VOLUME,
  MARKET_LOSERS,
  MARKET_METALS_FUTURES,
  MARKET_STOCK_TRENDS,
  MARKET_WORLD_INDICES,
  type MarketQuote,
} from "@/constants/markets-demo";
import { cn } from "@/lib/utils";

type MarketTab = "indices" | "stocks" | "crypto" | "futures" | "forex";

const TAB_IDS: MarketTab[] = ["indices", "stocks", "crypto", "futures", "forex"];

const tabTransition = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(4px)" },
};

function LiveBadge() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/25 bg-emerald/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-50 motion-reduce:animate-none" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
      </span>
      {t("markets.live")}
    </span>
  );
}

function MiniSpark({ quote, wide = false, delay = 0 }: { quote: MarketQuote; wide?: boolean; delay?: number }) {
  const id = `tv-spark-${quote.symbol.replace(/[^a-zA-Z0-9]/g, "")}-${wide ? "w" : "n"}`;
  const data = quote.sparkline.map((v) => ({ v }));
  const color = quote.up ? "#22c55e" : "#f87171";

  return (
    <div className={cn("h-9 sm:h-10", wide ? "w-full min-w-[88px]" : "w-[72px] sm:w-20")}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${id})`}
            isAnimationActive
            animationDuration={900}
            animationBegin={delay}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function FeaturedCard({ quote, index }: { quote: MarketQuote; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="min-w-[172px] shrink-0 snap-start sm:min-w-0"
    >
      <Link
        to="/trading-room"
        className="group relative block overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-secondary/20 p-4 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-emerald/35 hover:shadow-[0_12px_40px_rgba(16,185,129,0.08)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-emerald">
              {quote.name}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted">{quote.symbol}</p>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
              quote.up ? "bg-emerald/10 text-market-up" : "bg-red-500/10 text-market-down"
            )}
          >
            {quote.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {quote.change}
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="font-mono text-lg font-semibold tracking-tight text-foreground">{quote.price}</p>
          <MiniSpark quote={quote} delay={index * 80} />
        </div>
      </Link>
    </motion.div>
  );
}

function FeaturedStrip({ quotes }: { quotes: MarketQuote[] }) {
  return (
    <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 scrollbar-none sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
      {quotes.map((q, i) => (
        <FeaturedCard key={q.symbol} quote={q} index={i} />
      ))}
    </div>
  );
}

function TrendMarquee({ items }: { items: { symbol: string; name: string }[] }) {
  const loop = [...items, ...items];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-secondary/20 py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-secondary/20 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-secondary/20 to-transparent" />
      <div className="flex animate-marquee gap-3 whitespace-nowrap will-change-transform motion-reduce:animate-none">
        {loop.map((item, i) => (
          <Link
            key={`${item.symbol}-${i}`}
            to="/trading-room"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-void/50 px-4 py-2 transition-all duration-300 hover:border-emerald/40 hover:bg-emerald/[0.07] hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]"
          >
            <span className="font-mono text-xs font-bold text-emerald">{item.symbol}</span>
            <span className="max-w-[160px] truncate text-xs text-muted transition-colors group-hover:text-foreground">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function QuoteTable({
  rows,
  showCap = false,
  showVolume = false,
}: {
  rows: MarketQuote[];
  showCap?: boolean;
  showVolume?: boolean;
}) {
  const { t } = useTranslation();
  const thirdLabel = showCap ? t("markets.marketCap") : showVolume ? t("markets.volume") : t("markets.change");

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/40 shadow-sm backdrop-blur-sm">
      <div className="grid grid-cols-[1.35fr_0.95fr_0.75fr_68px] gap-2 border-b border-border/70 bg-secondary/25 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted sm:px-4">
        <span>{t("markets.symbol")}</span>
        <span className="text-right">{t("markets.priceChg")}</span>
        <span className="text-right">{thirdLabel}</span>
        <span className="text-right">{t("markets.trend")}</span>
      </div>
      <StaggerContainer className="divide-y divide-border/50">
        {rows.map((row, i) => (
          <StaggerItem key={row.symbol}>
            <Link
              to="/trading-room"
              className="group relative grid grid-cols-[1.35fr_0.95fr_0.75fr_68px] items-center gap-2 px-3 py-3 transition-colors hover:bg-emerald/[0.04] sm:px-4"
            >
              <span className="absolute inset-y-2 left-0 w-0.5 scale-y-0 rounded-full bg-emerald transition-transform duration-300 group-hover:scale-y-100" />
              <div className="min-w-0 pl-1">
                <p className="truncate font-mono text-sm font-bold text-foreground">{row.symbol}</p>
                <p className="truncate text-[11px] text-muted">{row.name}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs font-medium text-foreground sm:text-sm">{row.price}</p>
                <p className={cn("text-[11px] font-semibold", row.up ? "text-market-up" : "text-market-down")}>
                  {row.change}
                </p>
              </div>
              <p className="text-right font-mono text-xs text-muted sm:text-sm">
                {showCap ? row.marketCap ?? "—" : showVolume ? row.volume ?? "—" : row.change}
              </p>
              <div className="justify-self-end opacity-80 transition-opacity group-hover:opacity-100">
                <MiniSpark quote={row} delay={i * 60} />
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}

function SubPanel({
  title,
  seeAll,
  children,
  className,
}: {
  title: string;
  seeAll?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("min-w-0", className)}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-display text-sm font-semibold tracking-tight text-foreground md:text-base">{title}</h3>
        {seeAll && (
          <Link
            to="/trading-room"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald transition-colors hover:text-emerald-soft sm:text-xs"
          >
            {seeAll}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function TabContent({ tab }: { tab: MarketTab }) {
  const { t } = useTranslation();

  switch (tab) {
    case "indices":
      return (
        <div className="space-y-8">
          <FeaturedStrip quotes={MARKET_FEATURED_INDICES} />
          <SubPanel title={t("markets.worldIndices")} seeAll={t("markets.seeAllIndices")}>
            <QuoteTable rows={MARKET_WORLD_INDICES} />
          </SubPanel>
        </div>
      );
    case "stocks":
      return (
        <div className="space-y-8">
          <FeaturedStrip quotes={MARKET_FEATURED_STOCKS} />
          <SubPanel title={t("markets.communityTrends")}>
            <TrendMarquee items={MARKET_STOCK_TRENDS} />
          </SubPanel>
          <div className="grid gap-8 lg:grid-cols-2">
            <SubPanel title={t("markets.highestVolume")} seeAll={t("markets.seeAllVolume")}>
              <QuoteTable rows={MARKET_HIGH_VOLUME} showVolume />
            </SubPanel>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <SubPanel title={t("markets.gainers")} seeAll={t("markets.seeAllGainers")}>
                <QuoteTable rows={MARKET_GAINERS} />
              </SubPanel>
              <SubPanel title={t("markets.losers")} seeAll={t("markets.seeAllLosers")}>
                <QuoteTable rows={MARKET_LOSERS} />
              </SubPanel>
            </div>
          </div>
        </div>
      );
    case "crypto":
      return (
        <div className="space-y-8">
          <FeaturedStrip quotes={MARKET_FEATURED_CRYPTO} />
          <div className="grid gap-8 lg:grid-cols-2">
            <SubPanel title={t("markets.cryptoRanking")} seeAll={t("markets.seeAllCoins")}>
              <QuoteTable rows={MARKET_CRYPTO_RANKING} showCap />
            </SubPanel>
            <div className="grid gap-8 sm:grid-cols-2">
              <SubPanel title={t("markets.cryptoGainers")}>
                <QuoteTable rows={MARKET_CRYPTO_GAINERS} />
              </SubPanel>
              <SubPanel title={t("markets.cryptoLosers")}>
                <QuoteTable rows={MARKET_CRYPTO_LOSERS} />
              </SubPanel>
            </div>
          </div>
        </div>
      );
    case "futures":
      return (
        <div className="space-y-8">
          <FeaturedStrip quotes={MARKET_FEATURED_FUTURES} />
          <div className="grid gap-8 lg:grid-cols-2">
            <SubPanel title={t("markets.energy")} seeAll={t("markets.seeAllEnergy")}>
              <QuoteTable rows={MARKET_ENERGY} />
            </SubPanel>
            <SubPanel title={t("markets.metalsFutures")} seeAll={t("markets.seeAllMetals")}>
              <QuoteTable rows={MARKET_METALS_FUTURES} />
            </SubPanel>
          </div>
        </div>
      );
    case "forex":
      return (
        <div className="space-y-8">
          <FeaturedStrip quotes={MARKET_FEATURED_FOREX} />
          <SubPanel title={t("markets.majors")} seeAll={t("markets.seeAllForex")}>
            <QuoteTable rows={MARKET_FOREX_MAJORS} />
          </SubPanel>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-3"
          >
            {[
              { href: "/world-economy", label: t("markets.worldEconomy"), accent: true },
              { href: "/forex-news", label: t("markets.forexNews"), accent: true },
              { href: "/world-economy/trends", label: t("markets.globalTrends"), accent: false },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300",
                  link.accent
                    ? "border-emerald/25 bg-emerald/[0.06] text-emerald hover:border-emerald/40 hover:bg-emerald/10"
                    : "border-border text-muted hover:border-border hover:bg-secondary/40 hover:text-foreground"
                )}
              >
                {link.label}
                <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            ))}
          </motion.div>
        </div>
      );
    default:
      return null;
  }
}

export function MarketSummary() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<MarketTab>("stocks");

  const tabLabels: Record<MarketTab, string> = {
    indices: t("markets.indices"),
    stocks: t("markets.usStocks"),
    crypto: t("markets.crypto"),
    futures: t("markets.futures"),
    forex: t("markets.forex"),
  };

  return (
    <div id="markets" className="relative scroll-mt-28 overflow-hidden border-t border-border bg-[#141212] py-16 md:py-24">
      <Container className="relative">
        <FadeIn className="mb-10 md:mb-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <LiveBadge />
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-[1.08]">
                {t("capital.marketsTitle1")}
                <br />
                {t("capital.marketsTitle2")}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">{t("capital.marketsSubtitle")}</p>
            </div>
            <Link
              to="/trading-room"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-void transition-colors hover:bg-[#f4f3f3]"
            >
              {t("capital.exploreMarkets")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="mb-8">
          <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border/70 bg-secondary/25 p-1.5 scrollbar-none backdrop-blur-sm">
            {TAB_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "relative shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-300 sm:px-5",
                  activeTab === id ? "text-foreground" : "text-muted hover:text-foreground"
                )}
              >
                {activeTab === id && (
                  <motion.span
                    layoutId="market-tab-pill"
                    className="absolute inset-0 rounded-xl border border-emerald/20 bg-card shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-[1]">{tabLabels[id]}</span>
              </button>
            ))}
          </div>
        </FadeIn>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <TabContent tab={activeTab} />
          </motion.div>
        </AnimatePresence>
      </Container>
    </div>
  );
}
