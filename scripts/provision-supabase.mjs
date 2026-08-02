/**
 * Provisions the TradeMetria Supabase cloud project in the dedicated org.
 *
 * Requires:
 *   SUPABASE_ACCESS_TOKEN  (or .cursor/mcp.json)
 *
 * Usage: npm run provision-supabase
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const ORG_ID = "ufcmjexbegbqkfsubthf";
const ORG_NAME = "TradeMetria";
const PROJECT_NAME = "TradeMetria";
const REGION = "ca-central-1";
const API = "https://api.supabase.com/v1";

function loadAccessToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN) return process.env.SUPABASE_ACCESS_TOKEN;
  const mcpPath = resolve(root, ".cursor/mcp.json");
  if (!existsSync(mcpPath)) {
    throw new Error("Set SUPABASE_ACCESS_TOKEN or configure .cursor/mcp.json");
  }
  const mcp = JSON.parse(readFileSync(mcpPath, "utf8"));
  const token = mcp?.mcpServers?.supabase?.env?.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("SUPABASE_ACCESS_TOKEN missing in .cursor/mcp.json");
  return token;
}

async function api(token, path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message = data?.message ?? text ?? res.statusText;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomPassword() {
  return randomBytes(18).toString("base64url") + "A1!";
}

async function waitForHealthy(token, ref) {
  for (let i = 0; i < 60; i++) {
    const projects = await api(token, "/projects");
    const project = projects.find((p) => p.ref === ref);
    if (project?.status === "ACTIVE_HEALTHY") return project;
    process.stdout.write(".");
    await sleep(5000);
  }
  throw new Error(`Project ${ref} did not become ACTIVE_HEALTHY in time`);
}

async function findProject(token) {
  const projects = await api(token, "/projects");
  const byRef = process.env.PROJECT_REF
    ? projects.find((p) => p.ref === process.env.PROJECT_REF)
    : null;
  if (byRef) return byRef;
  return projects.find((p) => p.name === PROJECT_NAME);
}

async function createProject(token) {
  const existing = await findProject(token);
  if (existing) {
    console.log(`Using existing project: ${existing.ref}`);
    return existing;
  }

  const db_pass = randomPassword();
  try {
    const orgId = process.env.SUPABASE_ORG_ID || ORG_ID;
    const created = await api(token, "/projects", {
      method: "POST",
      body: {
        organization_id: orgId,
        name: PROJECT_NAME,
        db_pass,
        region: REGION,
        plan: "free",
      },
    });
    console.log(`Created project: ${created.ref ?? created.id}`);
    writeFileSync(
      resolve(root, ".supabase-db-credentials.local"),
      `# Keep secret — database password for ${PROJECT_NAME}\nDB_PASSWORD=${db_pass}\nPROJECT_REF=${created.ref ?? created.id}\n`,
      "utf8"
    );
    return created;
  } catch (err) {
    if (String(err.message).includes("2 project limit")) {
      console.error(`
Could not create a 3rd Supabase project on the free plan.

Your account already has 2 active projects:
  • BROKER backend (lcqzpvhiuaynqxarzvsk)
  • Platinum Crest Bank (dzxpdglotqafkfjhfsel)

The "${ORG_NAME}" organization is ready (org id: ${ORG_ID}).

To create the TradeMetria project WITHOUT pausing anything:
  1. Open https://supabase.com/dashboard/org/${ORG_ID}/billing
  2. Upgrade the organization to Pro (add a payment method)
  3. Run this command again: npm run provision-supabase

No existing projects will be paused.
`);
      process.exit(1);
    }
    throw err;
  }
}

async function getApiKeys(token, ref) {
  return api(token, `/projects/${ref}/api-keys`);
}

function migrationFiles() {
  const dir = resolve(root, "supabase/migrations");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => ({ name: f, path: join(dir, f) }));
}

async function applyMigrations(token, ref) {
  const files = migrationFiles();
  console.log(`Applying ${files.length} migrations...`);
  for (const file of files) {
    const sql = readFileSync(file.path, "utf8");
    process.stdout.write(`  ${file.name} ... `);
    await api(token, `/projects/${ref}/database/query`, {
      method: "POST",
      body: { query: sql },
    });
    console.log("ok");
  }
}

function writeEnv(url, anonKey, serviceKey) {
  const envPath = resolve(root, ".env");
  const lines = [
    `VITE_SUPABASE_URL=${url}`,
    `VITE_SUPABASE_ANON_KEY=${anonKey}`,
    `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`,
    "",
    "# Admin bootstrap (optional overrides)",
    "ADMIN_EMAIL=admin@trademetria.ai",
    "ADMIN_PASSWORD=TradeMetria@Admin2026!",
    "ADMIN_NAME=TradeMetria Admin",
    "",
  ];
  writeFileSync(envPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${envPath}`);
}

function updateMcpProjectRef(ref) {
  const mcpPath = resolve(root, ".cursor/mcp.json");
  if (!existsSync(mcpPath)) return;
  const mcp = JSON.parse(readFileSync(mcpPath, "utf8"));
  const args = mcp?.mcpServers?.supabase?.args;
  if (!Array.isArray(args)) return;
  const idx = args.findIndex((a) => String(a).startsWith("--project-ref="));
  if (idx >= 0) args[idx] = `--project-ref=${ref}`;
  writeFileSync(mcpPath, JSON.stringify(mcp, null, 2) + "\n", "utf8");
  console.log(`Updated .cursor/mcp.json project ref → ${ref}`);
}

async function createAdmin(url, serviceKey) {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const email = process.env.ADMIN_EMAIL || "admin@trademetria.ai";
  const password = process.env.ADMIN_PASSWORD || "TradeMetria@Admin2026!";
  const name = process.env.ADMIN_NAME || "TradeMetria Admin";

  const { data: existing } = await admin.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === email);
  if (found) {
    await admin.from("profiles").update({ role: "admin", full_name: name }).eq("id", found.id);
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error) throw error;

  await admin.from("profiles").update({ role: "admin", full_name: name }).eq("id", data.user.id);
  console.log(`Created admin: ${email}`);
}

async function main() {
  const token = loadAccessToken();
  console.log(`Organization: ${ORG_NAME} (${ORG_ID})`);

  const project = await createProject(token);
  const ref = project.ref ?? project.id;
  console.log(`Waiting for project ${ref} to become healthy...`);
  await waitForHealthy(token, ref);
  console.log("\nProject is healthy.");

  const keys = await getApiKeys(token, ref);
  const anon = keys.find((k) => k.name === "anon")?.api_key;
  const service = keys.find((k) => k.name === "service_role")?.api_key;
  if (!anon || !service) throw new Error("Could not fetch API keys");

  const url = `https://${ref}.supabase.co`;
  await applyMigrations(token, ref);
  writeEnv(url, anon, service);
  updateMcpProjectRef(ref);

  process.env.VITE_SUPABASE_URL = url;
  process.env.SUPABASE_SERVICE_ROLE_KEY = service;
  await createAdmin(url, service);

  console.log(`
TradeMetria Supabase is ready.

  Project URL : ${url}
  Dashboard   : https://supabase.com/dashboard/project/${ref}
  Admin login : admin@trademetria.ai / TradeMetria@Admin2026!
  App admin   : http://localhost:5173/admin-auth

Next: npm run dev
`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
