#!/usr/bin/env node
/**
 * Resize app icon PNGs from the master 512px asset.
 * Run after replacing public/icons/icon-512.png
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const master = path.join(root, "public", "icons", "icon-512.png");

function resize(width, output) {
  const result = spawnSync(
    "npx",
    ["--yes", "sharp-cli", "--input", master, "--output", output, "resize", String(width), String(width)],
    { stdio: "inherit", shell: true }
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

resize(192, path.join(root, "public", "icons", "icon-192.png"));
resize(180, path.join(root, "public", "icons", "apple-touch-icon.png"));
console.log("Generated icon-192.png and apple-touch-icon.png from icon-512.png");
