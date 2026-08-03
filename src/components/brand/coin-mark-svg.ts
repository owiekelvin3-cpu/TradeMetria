/** Bold geometric C — matches reference coin lockup. */
export const COIN_C_PATH =
  "M 22.25 9.5 C 17.5 7.15 10.75 7.5 8 11.25 C 6.1 13.85 6.1 18.15 8 20.75 C 10.75 24.5 17.5 24.85 22.25 22.5 L 19.85 19.35 C 16.85 20.85 13.15 20.55 11.35 18.55 C 9.85 16.85 9.85 15.15 11.35 13.45 C 13.15 11.45 16.85 11.15 19.85 12.65 Z";

export function coinMarkIds(suffix: string) {
  const s = suffix ? `-${suffix}` : "";
  return {
    rim: `coin-rim${s}`,
    rimHi: `coin-rim-hi${s}`,
    face: `coin-face${s}`,
    glow: `coin-glow${s}`,
    letter: `coin-letter${s}`,
    letterHi: `coin-letter-hi${s}`,
  };
}

/** Inner SVG elements for the coin mark (32×32 viewBox). */
export function renderCoinMarkBody(suffix = ""): string {
  const id = coinMarkIds(suffix);

  return `
  <defs>
    <linearGradient id="${id.rim}" x1="8" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F2C88A"/>
      <stop offset="42%" stop-color="#C88742"/>
      <stop offset="100%" stop-color="#5E3A1C"/>
    </linearGradient>
    <linearGradient id="${id.rimHi}" x1="10" y1="6" x2="22" y2="14" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFE8C4" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#FFE8C4" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${id.face}" cx="50%" cy="22%" r="72%">
      <stop offset="0%" stop-color="#3A2418"/>
      <stop offset="55%" stop-color="#140C08"/>
      <stop offset="100%" stop-color="#050302"/>
    </radialGradient>
    <radialGradient id="${id.glow}" cx="50%" cy="0%" r="85%">
      <stop offset="0%" stop-color="#B87333" stop-opacity="0.28"/>
      <stop offset="55%" stop-color="#B87333" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id.letter}" x1="8" y1="24" x2="22" y2="8" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFD49A"/>
      <stop offset="38%" stop-color="#E8A04E"/>
      <stop offset="100%" stop-color="#8B5428"/>
    </linearGradient>
    <linearGradient id="${id.letterHi}" x1="10" y1="22" x2="18" y2="14" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFF0D8" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#FFF0D8" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <circle cx="16" cy="16" r="14.25" fill="url(#${id.rim})"/>
  <circle cx="16" cy="16" r="14.25" fill="url(#${id.rimHi})"/>
  <circle cx="16" cy="16" r="11.35" fill="url(#${id.face})"/>
  <circle cx="16" cy="16" r="11.35" fill="url(#${id.glow})"/>
  <circle cx="16" cy="16" r="11.35" stroke="#8B5A2E" stroke-width="0.35" opacity="0.45"/>
  <path d="${COIN_C_PATH}" fill="url(#${id.letter})"/>
  <path d="${COIN_C_PATH}" fill="url(#${id.letterHi})"/>
  `.trim();
}

export function renderCoinMarkSvg(suffix = ""): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" aria-hidden="true">
${renderCoinMarkBody(suffix)}
</svg>`;
}
