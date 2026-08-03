/**
 * One-shot domain + Supabase auth configuration for capitalai.online
 * Usage: node scripts/configure-capitalai-domain.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const DOMAIN = "capitalai.online";
const PROJECT_REF = "ixglnopphwsrtqwylher";

function loadToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN) return process.env.SUPABASE_ACCESS_TOKEN;
  const mcpPath = resolve(root, ".cursor/mcp.json");
  if (!existsSync(mcpPath)) throw new Error("Missing SUPABASE_ACCESS_TOKEN");
  return JSON.parse(readFileSync(mcpPath, "utf8")).mcpServers.supabase.env.SUPABASE_ACCESS_TOKEN;
}

const redirectUrls = [
  `https://${DOMAIN}/**`,
  `https://www.${DOMAIN}/**`,
  "https://trademetria.vercel.app/**",
  "https://*.vercel.app/**",
  "http://localhost:5173/**",
  "http://localhost:5173",
  "http://localhost:3000/**",
];

const token = loadToken();
const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    site_url: `https://${DOMAIN}`,
    uri_allow_list: redirectUrls.join(","),
  }),
});

if (!res.ok) {
  console.error("Supabase auth update failed:", res.status, await res.text());
  process.exit(1);
}

const auth = await res.json();
console.log("Supabase auth configured:");
console.log("  site_url:", auth.site_url);
console.log("  uri_allow_list:", auth.uri_allow_list);

console.log("\nDNS (Namecheap / registrar-servers.com):");
console.log("  Option A — A record:  @  →  76.76.21.21");
console.log("  Option B — CNAME:     www →  cname.vercel-dns.com");
console.log("  Option C — Nameservers: ns1.vercel-dns.com, ns2.vercel-dns.com");
