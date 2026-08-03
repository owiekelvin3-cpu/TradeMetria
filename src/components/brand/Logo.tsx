import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";
import { CoinMark } from "@/components/brand/CoinMark";

export const BRAND_LOGO = {
  favicon: "/favicon.svg",
  appIcon192: "/icons/icon-192.png",
  appIcon512: "/icons/icon-512.png",
  appleTouch: "/icons/apple-touch-icon.png",
} as const;

interface LogoProps {
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gold";
}

const sizes = {
  sm: { icon: "h-7 w-7", word: "text-[15px]", gap: "gap-2" },
  md: { icon: "h-8 w-8", word: "text-[17px]", gap: "gap-2.5" },
  lg: { icon: "h-9 w-9", word: "text-[19px]", gap: "gap-3" },
};

/** Transparent SVG coin — no background, scales cleanly in dark and light UI. */
export function LogoIcon({
  className,
}: {
  className?: string;
  variant?: "default" | "gold";
}) {
  return <CoinMark className={className} />;
}

export function Logo({
  className,
  iconClassName,
  wordmarkClassName,
  showWordmark = true,
  size = "md",
  variant = "default",
}: LogoProps) {
  const s = sizes[size];

  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <LogoIcon className={cn(s.icon, iconClassName)} variant={variant} />
      {showWordmark && (
        <span
          className={cn(
            "inline-flex items-baseline gap-[0.35em] font-display font-semibold tracking-tight",
            s.word,
            wordmarkClassName
          )}
        >
          <span className="text-foreground">{BRAND.shortName}</span>
          <span
            className={cn(
              "font-semibold",
              variant === "gold" ? "text-gold" : "text-emerald"
            )}
          >
            {BRAND.wordmarkSuffix}
          </span>
        </span>
      )}
    </span>
  );
}
