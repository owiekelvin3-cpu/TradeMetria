#!/usr/bin/env node
/**
 * Regenerate transparent PWA icons from favicon.svg.
 * Run: npm run generate-icons
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svg = path.join(root, "public", "favicon.svg");
const iconsDir = path.join(root, "public", "icons");

const targets = [
  { width: 192, out: "icon-192.png" },
  { width: 512, out: "icon-512.png" },
  { width: 180, out: "apple-touch-icon.png" },
];

function runResvg(width, output) {
  const result = spawnSync(
    "npx",
    ["--yes", "@resvg/resvg-js-cli", "--fit-width", String(width), "--no-system-font", svg, output],
    { stdio: "inherit", shell: true }
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const { width, out } of targets) {
  runResvg(width, path.join(iconsDir, out));
  console.log(`Generated ${out} (${width}px, transparent)`);
}
