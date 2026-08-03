import { useId } from "react";
import { cn } from "@/lib/utils";
import { COIN_C_PATH, coinMarkIds } from "@/components/brand/coin-mark-svg";

type CoinMarkProps = {
  className?: string;
};

/** Metallic copper coin with bold C — transparent SVG, scales in dark/light UI. */
export function CoinMark({ className }: CoinMarkProps) {
  const id = coinMarkIds(useId().replace(/:/g, ""));

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("logo-mark shrink-0", className)}
    >
      <defs>
        <linearGradient id={id.rim} x1="8" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2C88A" />
          <stop offset="42%" stopColor="#C88742" />
          <stop offset="100%" stopColor="#5E3A1C" />
        </linearGradient>
        <linearGradient id={id.rimHi} x1="10" y1="6" x2="22" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE8C4" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#FFE8C4" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={id.face} cx="50%" cy="22%" r="72%">
          <stop offset="0%" stopColor="#3A2418" />
          <stop offset="55%" stopColor="#140C08" />
          <stop offset="100%" stopColor="#050302" />
        </radialGradient>
        <radialGradient id={id.glow} cx="50%" cy="0%" r="85%">
          <stop offset="0%" stopColor="#B87333" stopOpacity={0.28} />
          <stop offset="55%" stopColor="#B87333" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={id.letter} x1="8" y1="24" x2="22" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD49A" />
          <stop offset="38%" stopColor="#E8A04E" />
          <stop offset="100%" stopColor="#8B5428" />
        </linearGradient>
        <linearGradient id={id.letterHi} x1="10" y1="22" x2="18" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF0D8" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#FFF0D8" stopOpacity={0} />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14.25" fill={`url(#${id.rim})`} />
      <circle cx="16" cy="16" r="14.25" fill={`url(#${id.rimHi})`} />
      <circle cx="16" cy="16" r="11.35" fill={`url(#${id.face})`} />
      <circle cx="16" cy="16" r="11.35" fill={`url(#${id.glow})`} />
      <circle cx="16" cy="16" r="11.35" stroke="#8B5A2E" strokeWidth={0.35} opacity={0.45} />
      <path d={COIN_C_PATH} fill={`url(#${id.letter})`} />
      <path d={COIN_C_PATH} fill={`url(#${id.letterHi})`} />
    </svg>
  );
}
