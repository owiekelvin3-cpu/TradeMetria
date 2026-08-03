#!/usr/bin/env node
/** Sync public coin SVGs from coin-mark-svg.ts and regenerate PWA PNGs. */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { COIN_C_PATH, renderCoinMarkSvg } from "../src/components/brand/coin-mark-svg.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

const coinSvg = renderCoinMarkSvg();
fs.writeFileSync(path.join(publicDir, "favicon.svg"), coinSvg + "\n");
fs.writeFileSync(path.join(publicDir, "icons", "icon.svg"), coinSvg + "\n");

const lockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 36" fill="none">
  <defs>
    <linearGradient id="lockup-rim" x1="8" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F2C88A"/>
      <stop offset="42%" stop-color="#C88742"/>
      <stop offset="100%" stop-color="#5E3A1C"/>
    </linearGradient>
    <linearGradient id="lockup-rim-hi" x1="10" y1="6" x2="22" y2="14" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFE8C4" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#FFE8C4" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="lockup-face" cx="50%" cy="22%" r="72%">
      <stop offset="0%" stop-color="#3A2418"/>
      <stop offset="55%" stop-color="#140C08"/>
      <stop offset="100%" stop-color="#050302"/>
    </radialGradient>
    <radialGradient id="lockup-glow" cx="50%" cy="0%" r="85%">
      <stop offset="0%" stop-color="#B87333" stop-opacity="0.28"/>
      <stop offset="55%" stop-color="#B87333" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="lockup-letter" x1="8" y1="24" x2="22" y2="8" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFD49A"/>
      <stop offset="38%" stop-color="#E8A04E"/>
      <stop offset="100%" stop-color="#8B5428"/>
    </linearGradient>
    <linearGradient id="lockup-letter-hi" x1="10" y1="22" x2="18" y2="14" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFF0D8" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#FFF0D8" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <g transform="translate(0 2)">
    <circle cx="16" cy="16" r="14.25" fill="url(#lockup-rim)"/>
    <circle cx="16" cy="16" r="14.25" fill="url(#lockup-rim-hi)"/>
    <circle cx="16" cy="16" r="11.35" fill="url(#lockup-face)"/>
    <circle cx="16" cy="16" r="11.35" fill="url(#lockup-glow)"/>
    <circle cx="16" cy="16" r="11.35" stroke="#8B5A2E" stroke-width="0.35" opacity="0.45"/>
    <path d="${COIN_C_PATH}" fill="url(#lockup-letter)"/>
    <path d="${COIN_C_PATH}" fill="url(#lockup-letter-hi)"/>
  </g>
  <text x="42" y="26" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="650" fill="#F4F3F3" letter-spacing="-0.02em">Capital</text>
  <text x="112" y="26" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="650" fill="#FBBE5B" letter-spacing="-0.02em">AI</text>
</svg>
`;
fs.writeFileSync(path.join(publicDir, "logo.svg"), lockupSvg + "\n");

console.log("Synced favicon.svg, icons/icon.svg, logo.svg");
execSync("node scripts/generate-pwa-icons.mjs", { cwd: root, stdio: "inherit" });
