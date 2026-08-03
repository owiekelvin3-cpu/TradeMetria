import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";

export const BRAND_LOGO = {
  dark: "/icons/coin-logo-dark.png",
  light: "/icons/coin-logo-light.png",
  appIcon192: "/icons/icon-192.png",
  appIcon512: "/icons/icon-512.png",
  appleTouch: "/icons/apple-touch-icon.png",
  ogImage: "/og-image.png",
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

/** Photorealistic coin — separate assets tuned for dark and light UI. */
export function LogoIcon({
  className,
}: {
  className?: string;
  variant?: "default" | "gold";
}) {
  return (
    <span className={cn("inline-grid shrink-0", className)}>
      <img
        src={BRAND_LOGO.dark}
        alt=""
        aria-hidden="true"
        width={256}
        height={256}
        decoding="async"
        className="logo-mark logo-mark-dark col-start-1 row-start-1 h-full w-full object-contain"
      />
      <img
        src={BRAND_LOGO.light}
        alt=""
        aria-hidden="true"
        width={256}
        height={256}
        decoding="async"
        className="logo-mark logo-mark-light col-start-1 row-start-1 h-full w-full object-contain"
      />
    </span>
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
