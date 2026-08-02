/**
 * Connect Cursor Supabase MCP to a Supabase account/project.
 *
 * Usage:
 *   node scripts/connect-mcp.mjs <access-token> <project-ref>
 *
 * Get a token: https://supabase.com/dashboard/account/tokens
 * Get project ref: Project Settings → General → Reference ID
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const mcpPath = resolve(root, ".cursor/mcp.json");

const token = process.argv[2]?.trim();
const projectRef = process.argv[3]?.trim();

if (!token || !projectRef) {
  console.error(`
Usage: node scripts/connect-mcp.mjs <access-token> <project-ref>

1. Log into your Supabase account in the browser
2. Create a token: https://supabase.com/dashboard/account/tokens
3. Copy your project ref from Settings → General → Reference ID
4. Run this script with both values
`);
  process.exit(1);
}

if (!token.startsWith("sbp_")) {
  console.warn("Warning: Supabase personal access tokens usually start with sbp_");
}

async function verify(token, projectRef) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? `Could not access project ${projectRef}`);
  }
  return data;
}

const mcp = {
  mcpServers: {
    supabase: {
      command: "cmd",
      args: [
        "/c",
        "npx",
        "-y",
        "-p",
        "@supabase/mcp-server-supabase@latest",
        "-p",
        "openapi-fetch",
        "mcp-server-supabase",
        `--project-ref=${projectRef}`,
      ],
      env: {
        SUPABASE_ACCESS_TOKEN: token,
      },
    },
  },
};

mkdirSync(resolve(root, ".cursor"), { recursive: true });
writeFileSync(mcpPath, JSON.stringify(mcp, null, 2) + "\n", "utf8");

const project = await verify(token, projectRef);
console.log(`MCP configured for project: ${project.name} (${projectRef})`);
console.log(`Project URL: https://${projectRef}.supabase.co`);
console.log("\nReload Cursor: Ctrl+Shift+P → Developer: Reload Window");
console.log("Then check Settings → Features → MCP — Supabase should show green.");
