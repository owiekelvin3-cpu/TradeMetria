import { useId, useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Bold serif-style C — reads clearly on a coin at small sizes. */
export const COIN_C_PATH =
  "M 21.35 8.45 C 18.05 6.85 13.95 6.85 10.65 8.45 C 8.55 9.55 7.4 11.55 7.4 13.65 C 7.4 15.75 8.55 17.75 10.65 18.85 C 13.95 20.45 18.05 20.45 21.35 18.85 L 19.75 16.35 C 17.45 17.45 14.55 17.45 12.25 16.35 C 11.05 15.65 10.35 14.7 10.35 13.65 C 10.35 12.6 11.05 11.65 12.25 10.95 C 14.55 9.85 17.45 9.85 19.75 10.95 Z";

type CoinMarkProps = {
  className?: string;
};

/** Photorealistic copper coin with embossed gold "C". */
export function CoinMark({ className }: CoinMarkProps) {
  const uid = useId().replace(/:/g, "");
  const ids = {
    outerRim: `cm-or-${uid}`,
    rimHighlight: `cm-rh-${uid}`,
    groove: `cm-gr-${uid}`,
    face: `cm-fc-${uid}`,
    warmGlow: `cm-wg-${uid}`,
    letter: `cm-lt-${uid}`,
    letterShine: `cm-ls-${uid}`,
    letterEdge: `cm-le-${uid}`,
    coinShadow: `cm-cs-${uid}`,
    emboss: `cm-em-${uid}`,
  };

  const reeds = useMemo(() => {
    const lines: ReactNode[] = [];
    const count = 48;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x1 = 16 + cos * 13.55;
      const y1 = 16 + sin * 13.55;
      const x2 = 16 + cos * 14.15;
      const y2 = 16 + sin * 14.15;
      lines.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#1A0E08"
          strokeWidth="0.22"
          strokeLinecap="round"
          opacity={0.35 + (i % 2) * 0.15}
        />
      );
    }
    return lines;
  }, []);

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("logo-mark shrink-0", className)}
    >
      <defs>
        <linearGradient id={ids.outerRim} x1="5" y1="3" x2="27" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0C890" />
          <stop offset="18%" stopColor="#C88942" />
          <stop offset="42%" stopColor="#7A4A22" />
          <stop offset="68%" stopColor="#3D2414" />
          <stop offset="100%" stopColor="#120A06" />
        </linearGradient>
        <linearGradient id={ids.rimHighlight} x1="16" y1="2" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE8C8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFE8C8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={ids.groove} x1="10" y1="8" x2="22" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2A1810" />
          <stop offset="50%" stopColor="#0A0604" />
          <stop offset="100%" stopColor="#1E120C" />
        </linearGradient>
        <radialGradient id={ids.face} cx="36%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#3A2218" />
          <stop offset="45%" stopColor="#1A100A" />
          <stop offset="100%" stopColor="#060403" />
        </radialGradient>
        <radialGradient id={ids.warmGlow} cx="48%" cy="46%" r="38%">
          <stop offset="0%" stopColor="#E8942A" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#E8942A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.letter} x1="10" y1="7" x2="22" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF4E0" />
          <stop offset="22%" stopColor="#F4B04A" />
          <stop offset="55%" stopColor="#C8741E" />
          <stop offset="100%" stopColor="#6B3A10" />
        </linearGradient>
        <linearGradient id={ids.letterShine} x1="9" y1="7" x2="18" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFAF0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFAF0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={ids.letterEdge} x1="8" y1="22" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3A2010" stopOpacity="0" />
          <stop offset="50%" stopColor="#3A2010" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3A2010" stopOpacity="0" />
        </linearGradient>
        <filter id={ids.coinShadow} x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0.55" stdDeviation="0.45" floodColor="#000000" floodOpacity="0.45" />
        </filter>
        <filter id={ids.emboss} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="0.32" stdDeviation="0.18" floodColor="#000000" floodOpacity="0.6" />
          <feDropShadow dx="-0.14" dy="-0.12" stdDeviation="0.06" floodColor="#FFD9A0" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter={`url(#${ids.coinShadow})`}>
        <circle cx="16" cy="16.35" r="14.15" fill={`url(#${ids.outerRim})`} />
        <g>{reeds}</g>
        <circle cx="16" cy="16" r="13.35" fill={`url(#${ids.groove})`} />
        <circle cx="16" cy="16" r="12.45" fill={`url(#${ids.face})`} />
        <circle cx="16" cy="16" r="12.45" fill={`url(#${ids.warmGlow})`} />
        <circle cx="16" cy="16" r="14.15" fill={`url(#${ids.rimHighlight})`} />

        <path
          d="M 5.5 16 A 10.5 10.5 0 0 1 26.5 16"
          stroke="#D4A574"
          strokeWidth="0.35"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M 6.5 16 A 9.5 9.5 0 0 0 25.5 16"
          stroke="#000000"
          strokeWidth="0.2"
          fill="none"
          opacity="0.22"
        />

        <ellipse cx="10.8" cy="9.8" rx="3.8" ry="2.2" fill="#FFF8EE" opacity="0.14" transform="rotate(-32 10.8 9.8)" />

        <path d={COIN_C_PATH} fill="#120804" transform="translate(0.2 0.32)" opacity="0.55" />

        <g filter={`url(#${ids.emboss})`}>
          <path d={COIN_C_PATH} fill={`url(#${ids.letter})`} />
          <path d={COIN_C_PATH} fill={`url(#${ids.letterShine})`} opacity="0.48" />
        </g>
        <path d={COIN_C_PATH} fill={`url(#${ids.letterEdge})`} opacity="0.35" />
      </g>
    </svg>
  );
}
