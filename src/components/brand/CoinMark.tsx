import { useId } from "react";
import { cn } from "@/lib/utils";

/** Clean bold C — legible at favicon and header sizes. */
export const COIN_C_PATH =
  "M 21 8.5 C 17.2 7 12.8 7 9 8.5 C 6.8 9.6 5.5 11.8 5.5 14.5 C 5.5 17.2 6.8 19.4 9 20.5 C 12.8 22 17.2 22 21 20.5 L 19 17.8 C 16.5 18.9 13.5 18.9 11 17.8 C 9.8 17.1 9 15.9 9 14.5 C 9 13.1 9.8 11.9 11 11.2 C 13.5 10.1 16.5 10.1 19 11.2 Z";

type CoinMarkProps = {
  className?: string;
};

/** Minimal copper coin mark — transparent, no filters, no fake photo effects. */
export function CoinMark({ className }: CoinMarkProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("logo-mark shrink-0", className)}
    >
      <defs>
        <linearGradient id={`rim-${uid}`} x1="7" y1="5" x2="25" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E4B070" />
          <stop offset="100%" stopColor="#7A4E28" />
        </linearGradient>
        <radialGradient id={`face-${uid}`} cx="34%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#2A1810" />
          <stop offset="100%" stopColor="#0A0604" />
        </radialGradient>
        <linearGradient id={`letter-${uid}`} x1="10" y1="8" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5C978" />
          <stop offset="100%" stopColor="#B87A28" />
        </linearGradient>
      </defs>

      <circle cx="16" cy="16" r="14" fill={`url(#rim-${uid})`} />
      <circle cx="16" cy="16" r="11.25" fill={`url(#face-${uid})`} />
      <circle cx="16" cy="16" r="11.25" stroke="#A06B38" strokeWidth="0.45" opacity="0.5" />
      <path d={COIN_C_PATH} fill={`url(#letter-${uid})`} />
    </svg>
  );
}
