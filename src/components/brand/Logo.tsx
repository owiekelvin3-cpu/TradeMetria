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

/** Photorealistic copper coin mark — CapitalAI brand icon. */
export function LogoIcon({
  className,
}: {
  className?: string;
  variant?: "default" | "gold";
}) {
  return (
    <img
      src="/icons/coin-logo.png"
      alt=""
      width={32}
      height={32}
      decoding="async"
      className={cn("shrink-0 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]", className)}
      aria-hidden="true"
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
