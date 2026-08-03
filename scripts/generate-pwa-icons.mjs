#!/usr/bin/env node
/**
 * Regenerate PNG brand assets from SVG sources.
 * Run: npm run generate-icons
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const iconsDir = path.join(publicDir, "icons");
const coinSvg = path.join(publicDir, "favicon.svg");
const lockupSvg = path.join(publicDir, "logo.svg");

const targets = [
  { svg: coinSvg, width: 32, out: path.join(iconsDir, "favicon-32.png") },
  { svg: coinSvg, width: 64, out: path.join(publicDir, "favicon.png") },
  { svg: coinSvg, width: 256, out: path.join(iconsDir, "coin-logo.png") },
  { svg: coinSvg, width: 512, out: path.join(iconsDir, "coin-logo-512.png") },
  { svg: coinSvg, width: 192, out: path.join(iconsDir, "icon-192.png") },
  { svg: coinSvg, width: 512, out: path.join(iconsDir, "icon-512.png") },
  { svg: coinSvg, width: 180, out: path.join(iconsDir, "apple-touch-icon.png") },
  { svg: lockupSvg, width: 480, out: path.join(publicDir, "logo-lockup.png") },
  { svg: lockupSvg, width: 960, out: path.join(publicDir, "logo-lockup-2x.png") },
];

function runResvg(svg, width, output) {
  if (!fs.existsSync(svg)) {
    console.error(`Missing SVG: ${svg}`);
    process.exit(1);
  }
  const result = spawnSync(
    "npx",
    ["--yes", "@resvg/resvg-js-cli", "--fit-width", String(width), "--no-system-font", svg, output],
    { stdio: "inherit", shell: true }
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const { svg, width, out } of targets) {
  runResvg(svg, width, out);
  console.log(`Generated ${path.relative(root, out)} (${width}px, transparent)`);
}
