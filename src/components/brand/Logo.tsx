import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";

export const BRAND_LOGO = {
  coin: "/icons/coin-logo.png",
  coin2x: "/icons/coin-logo-512.png",
  lockup: "/logo-lockup.png",
  lockup2x: "/logo-lockup-2x.png",
  favicon: "/favicon.png",
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

/** PNG coin mark — transparent background, crisp on dark and light UI. */
export function LogoIcon({ className }: { className?: string; variant?: "default" | "gold" }) {
  return (
    <img
      src={BRAND_LOGO.coin}
      srcSet={`${BRAND_LOGO.coin} 1x, ${BRAND_LOGO.coin2x} 2x`}
      alt=""
      width={256}
      height={256}
      decoding="async"
      className={cn("object-contain", className)}
    />
  );
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
