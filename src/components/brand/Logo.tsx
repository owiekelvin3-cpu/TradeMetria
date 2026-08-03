import { useId } from "react";
import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";

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

/** Copper coin mark — crisp SVG, transparent background, readable in light and dark UI. */
export function LogoIcon({
  className,
}: {
  className?: string;
  variant?: "default" | "gold";
}) {
  const uid = useId().replace(/:/g, "");
  const ids = {
    face: `ca-face-${uid}`,
    outerRim: `ca-rim-${uid}`,
    innerRim: `ca-inner-${uid}`,
    glow: `ca-glow-${uid}`,
    letter: `ca-letter-${uid}`,
    shine: `ca-shine-${uid}`,
  };

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("logo-mark shrink-0", className)}
    >
      <defs>
        <radialGradient id={ids.face} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#2A1810" />
          <stop offset="55%" stopColor="#120A06" />
          <stop offset="100%" stopColor="#060403" />
        </radialGradient>
        <linearGradient id={ids.outerRim} x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E8B878" />
          <stop offset="30%" stopColor="#A86B2A" />
          <stop offset="100%" stopColor="#2A1810" />
        </linearGradient>
        <linearGradient id={ids.innerRim} x1="8" y1="6" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6B4226" />
          <stop offset="100%" stopColor="#120804" />
        </linearGradient>
        <radialGradient id={ids.glow} cx="50%" cy="48%" r="42%">
          <stop offset="0%" stopColor="#E8942A" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#E8942A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.letter} x1="11" y1="8" x2="21" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF0D4" />
          <stop offset="35%" stopColor="#F4B04A" />
          <stop offset="70%" stopColor="#C8741E" />
          <stop offset="100%" stopColor="#8B4A12" />
        </linearGradient>
        <linearGradient id={ids.shine} x1="10" y1="7.5" x2="17.5" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF8EE" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFF8EE" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="16" cy="16" r="14.5" fill={`url(#${ids.outerRim})`} />
      <circle cx="16" cy="16" r="13.25" fill={`url(#${ids.innerRim})`} />
      <circle cx="16" cy="16" r="12" fill={`url(#${ids.face})`} />
      <circle cx="16" cy="16" r="12" fill={`url(#${ids.glow})`} />

      <path
        d="M 20.9 8.9 C 17.9 7.4 14.1 7.4 11.1 8.9 C 9.25 9.95 8.25 11.75 8.25 13.65 C 8.25 15.55 9.25 17.35 11.1 18.4 C 14.1 19.9 17.9 19.9 20.9 18.4 L 19.5 16.15 C 17.4 17.15 14.6 17.15 12.5 16.15 C 11.5 15.55 10.95 14.65 10.95 13.65 C 10.95 12.65 11.5 11.75 12.5 11.15 C 14.6 10.15 17.4 10.15 19.5 11.15 Z"
        fill={`url(#${ids.letter})`}
      />
      <path
        d="M 20.9 8.9 C 17.9 7.4 14.1 7.4 11.1 8.9 C 9.25 9.95 8.25 11.75 8.25 13.65 C 8.25 15.55 9.25 17.35 11.1 18.4 C 14.1 19.9 17.9 19.9 20.9 18.4 L 19.5 16.15 C 17.4 17.15 14.6 17.15 12.5 16.15 C 11.5 15.55 10.95 14.65 10.95 13.65 C 10.95 12.65 11.5 11.75 12.5 11.15 C 14.6 10.15 17.4 10.15 19.5 11.15 Z"
        fill={`url(#${ids.shine})`}
        opacity="0.35"
      />
    </svg>
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
