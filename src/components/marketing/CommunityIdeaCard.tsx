import { useTranslation } from "react-i18next";
import type { CommunityIdea, IdeaBias } from "@/lib/community-feed";
import { formatArticleTime } from "@/lib/community-feed";
import { cn } from "@/lib/utils";

function BiasBadge({ bias }: { bias: IdeaBias }) {
  const { t } = useTranslation();
  if (bias === "neutral") return null;
  if (bias === "education") {
    return (
      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-secondary text-muted">
        {t("pages.ideasEducation")}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        bias === "long" && "bg-emerald/15 text-market-up",
        bias === "short" && "bg-red-500/15 text-market-down"
      )}
    >
      {t(`insights.bias.${bias}`)}
    </span>
  );
}

type CommunityIdeaCardProps = {
  idea: CommunityIdea;
  variant?: "default" | "featured" | "compact";
};

export function CommunityIdeaCard({ idea, variant = "default" }: CommunityIdeaCardProps) {
  const { t, i18n } = useTranslation();
  if (!idea.image) return null;

  const biasLabel =
    idea.bias === "long" ? "long" : idea.bias === "short" ? "short" : idea.bias === "education" ? "education" : null;

  if (variant === "compact") {
    return (
      <a
        href={idea.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-3 border-b border-border/60 py-3.5 transition-colors last:border-0 hover:bg-secondary/30 sm:items-center"
      >
        <span className="shrink-0 font-mono text-[11px] text-muted">
          {formatArticleTime(idea.publishedAt, i18n.language)}
        </span>
        <span className="hidden shrink-0 rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold sm:inline">
          {idea.symbol}
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground group-hover:text-emerald">
          {idea.title}
        </span>
        <span className="hidden shrink-0 text-xs text-muted sm:inline">{idea.source}</span>
      </a>
    );
  }

  return (
    <a
      href={idea.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-void/20 transition-all hover:border-emerald/35 hover:shadow-[0_12px_40px_rgba(16,185,129,0.08)]",
        variant === "featured" && "md:flex-row md:items-stretch"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-secondary/50",
          variant === "featured" ? "aspect-[16/10] md:aspect-auto md:w-[52%]" : "aspect-[16/10]"
        )}
      >
        <img
          src={idea.image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-3">
          <span className="rounded bg-black/55 px-2 py-0.5 font-mono text-[11px] font-semibold text-white backdrop-blur-sm">
            {idea.symbol}
          </span>
          {biasLabel && biasLabel !== "education" ? (
            <span
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white",
                biasLabel === "long" ? "bg-emerald/80" : "bg-red-500/80"
              )}
            >
              {t(`insights.bias.${biasLabel}`)}
            </span>
          ) : biasLabel === "education" ? (
            <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              {t("pages.ideasEducation")}
            </span>
          ) : null}
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col p-4", variant === "featured" && "md:p-6 md:justify-center")}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald">{idea.source}</p>
        <h3
          className={cn(
            "mt-2 line-clamp-2 font-display font-semibold leading-snug text-foreground group-hover:text-emerald",
            variant === "featured" ? "text-lg md:text-xl" : "text-[15px]"
          )}
        >
          {idea.title}
        </h3>
        {idea.summary ? (
          <p
            className={cn(
              "mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted",
              variant === "featured" && "line-clamp-4 md:text-base"
            )}
          >
            {idea.summary}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <BiasBadge bias={idea.bias} />
          <span>
            {t("insights.by")}{" "}
            <span className="font-medium text-foreground/80">{idea.handle}</span>
          </span>
          {idea.updated ? (
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald">
              {t("pages.ideasUpdated")}
            </span>
          ) : null}
          <span className="ml-auto font-mono text-[11px]">
            {formatArticleTime(idea.publishedAt, i18n.language)}
          </span>
        </div>
      </div>
    </a>
  );
}
