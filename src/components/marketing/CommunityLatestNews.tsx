import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "@/lib/icons";
import {
  articlesToIdeas,
  COMMUNITY_SOURCES,
  fetchCommunityArticles,
  type CommunityIdea,
} from "@/lib/community-feed";
import { CommunityIdeaCard } from "@/components/marketing/CommunityIdeaCard";
import { FadeIn } from "@/components/motion/Motion";
import { Section, Container } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/constants/brand";

function NewsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border md:flex">
        <div className="aspect-[16/10] flex-1 animate-pulse bg-secondary/50 md:aspect-auto md:min-h-[280px]" />
        <div className="flex-1 space-y-3 p-6">
          <div className="h-3 w-24 animate-pulse rounded bg-secondary/50" />
          <div className="h-6 w-4/5 animate-pulse rounded bg-secondary/50" />
          <div className="h-4 w-full animate-pulse rounded bg-secondary/40" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-secondary/40" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border">
            <div className="aspect-[16/10] animate-pulse bg-secondary/50" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-4/5 animate-pulse rounded bg-secondary/50" />
              <div className="h-3 w-full animate-pulse rounded bg-secondary/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommunityLatestNews() {
  const { t } = useTranslation();
  const [ideas, setIdeas] = useState<CommunityIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const articles = await fetchCommunityArticles();
        if (cancelled) return;
        setIdeas(articlesToIdeas(articles).filter((i) => Boolean(i.image)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { featured, grid, list } = useMemo(() => {
    const sorted = [...ideas].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    return {
      featured: sorted[0] ?? null,
      grid: sorted.slice(1, 4),
      list: sorted.slice(4, 8),
    };
  }, [ideas]);

  return (
    <Section id="community-news" variant="elevated" className="section-padding-sm !py-16 md:!py-24">
      <Container>
        <FadeIn className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
              {t("homeCommunity.eyebrow")}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("homeCommunity.title")}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
              {t("homeCommunity.subtitle", { brand: BRAND.name })}
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 rounded-full px-6">
            <Link to="/community">
              {t("homeCommunity.viewAll")} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </FadeIn>

        <FadeIn className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {t("homeCommunity.sourcesLabel")}
          </span>
          {COMMUNITY_SOURCES.map((source) => (
            <span
              key={source.id}
              className="rounded-full border border-border bg-void/30 px-3 py-1 text-[11px] font-medium text-foreground/80"
            >
              {source.name}
            </span>
          ))}
        </FadeIn>

        {loading ? (
          <div className="mt-10">
            <NewsSkeleton />
          </div>
        ) : ideas.length === 0 ? (
          <p className="mt-10 rounded-xl border border-border bg-secondary/20 p-6 text-sm text-muted">
            {t("pages.communityEmpty")}{" "}
            <Link to="/community" className="font-semibold text-emerald hover:underline">
              {t("homeCommunity.viewAll")}
            </Link>
          </p>
        ) : (
          <FadeIn className="mt-10 space-y-8">
            {featured ? <CommunityIdeaCard idea={featured} variant="featured" /> : null}

            {grid.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((idea) => (
                  <CommunityIdeaCard key={idea.id} idea={idea} />
                ))}
              </div>
            ) : null}

            {list.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-void/10 px-4 sm:px-5">
                <div className="hidden grid-cols-[64px_72px_1fr_96px] gap-3 border-b border-border py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted sm:grid">
                  <span>{t("communityPulse.colTime")}</span>
                  <span>{t("communityPulse.colInstrument")}</span>
                  <span>{t("communityPulse.colHeadline")}</span>
                  <span className="text-right">{t("communityPulse.colProvider")}</span>
                </div>
                {list.map((idea) => (
                  <CommunityIdeaCard key={idea.id} idea={idea} variant="compact" />
                ))}
              </div>
            ) : null}

            <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald/20 bg-emerald/[0.04] p-6 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <p className="font-display text-lg font-bold text-foreground">{t("homeCommunity.ctaTitle")}</p>
                <p className="mt-1 text-sm text-muted">{t("homeCommunity.ctaSub")}</p>
              </div>
              <Button asChild className="rounded-full px-6">
                <Link to="/community">
                  {t("homeCommunity.viewAll")} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        )}
      </Container>
    </Section>
  );
}
