import { supabase } from "@/lib/supabase";

export type PortfolioRequirementSource = "none" | "global" | "override" | "waived";

export interface PortfolioRequirementStatus {
  enabled: boolean;
  waived: boolean;
  source: PortfolioRequirementSource;
  requirement: number;
  deposit_total: number;
  remaining: number;
  currency: string;
  can_withdraw: boolean;
}

export interface WithdrawalEligibility {
  portfolio: PortfolioRequirementStatus;
  pending_fees_count: number;
  can_withdraw: boolean;
}

export interface GlobalPortfolioRequirementSettings {
  enabled: boolean;
  min_deposit_total: number;
  currency: string;
}

const PORTFOLIO_SETTINGS_KEY = "withdrawal_portfolio_requirement";

function parseGlobalSettings(raw: unknown): GlobalPortfolioRequirementSettings {
  const row = (typeof raw === "string" ? JSON.parse(raw) : raw ?? {}) as Record<string, unknown>;
  return {
    enabled: Boolean(row.enabled),
    min_deposit_total: Number(row.min_deposit_total ?? 0),
    currency: String(row.currency ?? "USD"),
  };
}

function parsePortfolioStatus(raw: unknown): PortfolioRequirementStatus {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    enabled: Boolean(row.enabled),
    waived: Boolean(row.waived),
    source: (row.source as PortfolioRequirementSource) ?? "none",
    requirement: Number(row.requirement ?? 0),
    deposit_total: Number(row.deposit_total ?? 0),
    remaining: Number(row.remaining ?? 0),
    currency: String(row.currency ?? "USD"),
    can_withdraw: Boolean(row.can_withdraw),
  };
}

export async function fetchWithdrawalEligibility(): Promise<WithdrawalEligibility> {
  const { data, error } = await supabase.rpc("get_withdrawal_eligibility");
  if (!error && data) {
    const payload = data as Record<string, unknown>;
    return {
      portfolio: parsePortfolioStatus(payload.portfolio),
      pending_fees_count: Number(payload.pending_fees_count ?? 0),
      can_withdraw: Boolean(payload.can_withdraw),
    };
  }

  try {
    return await fetchWithdrawalEligibilityFallback();
  } catch (fallbackError) {
    if (error) throw error;
    throw fallbackError;
  }
}

async function fetchWithdrawalEligibilityFallback(): Promise<WithdrawalEligibility> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error("Not authenticated");

  const userId = authData.user.id;
  const [settingsRes, profileRes, depositsRes, feesRes] = await Promise.all([
    supabase.from("platform_settings").select("value").eq("key", PORTFOLIO_SETTINGS_KEY).maybeSingle(),
    supabase
      .from("profiles")
      .select("portfolio_requirement_override, portfolio_requirement_waived")
      .eq("id", userId)
      .single(),
    supabase.from("deposits").select("amount, status").eq("user_id", userId),
    supabase.from("user_fees").select("id").eq("user_id", userId).eq("status", "pending"),
  ]);

  if (settingsRes.error) throw settingsRes.error;
  if (profileRes.error) throw profileRes.error;
  if (depositsRes.error) throw depositsRes.error;
  if (feesRes.error) throw feesRes.error;

  const global = parseGlobalSettings(settingsRes.data?.value);
  const profile = profileRes.data;
  const depositTotal = (depositsRes.data ?? [])
    .filter((d) => d.status === "completed" || d.status === "approved")
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const pendingFeesCount = feesRes.data?.length ?? 0;

  const portfolio = computePortfolioStatus({
    global,
    override: profile?.portfolio_requirement_override ?? null,
    waived: Boolean(profile?.portfolio_requirement_waived),
    depositTotal,
  });

  return {
    portfolio,
    pending_fees_count: pendingFeesCount,
    can_withdraw: portfolio.can_withdraw && pendingFeesCount === 0,
  };
}

export function computePortfolioStatus(params: {
  global: GlobalPortfolioRequirementSettings;
  override: number | null;
  waived: boolean;
  depositTotal: number;
}): PortfolioRequirementStatus {
  const { global, override, waived, depositTotal } = params;

  if (waived) {
    return {
      enabled: global.enabled,
      waived: true,
      source: "waived",
      requirement: 0,
      deposit_total: depositTotal,
      remaining: 0,
      currency: global.currency,
      can_withdraw: true,
    };
  }

  let requirement = 0;
  let source: PortfolioRequirementSource = "none";
  let enabled = false;

  if (override != null) {
    requirement = Math.max(Number(override), 0);
    source = "override";
    enabled = true;
  } else if (global.enabled) {
    requirement = Math.max(global.min_deposit_total, 0);
    source = "global";
    enabled = true;
  } else {
    return {
      enabled: false,
      waived: false,
      source: "none",
      requirement: 0,
      deposit_total: depositTotal,
      remaining: 0,
      currency: global.currency,
      can_withdraw: true,
    };
  }

  const remaining = Math.max(requirement - depositTotal, 0);
  return {
    enabled,
    waived: false,
    source,
    requirement,
    deposit_total: depositTotal,
    remaining,
    currency: global.currency,
    can_withdraw: depositTotal >= requirement,
  };
}

export async function fetchGlobalPortfolioRequirementSettings(): Promise<GlobalPortfolioRequirementSettings> {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", PORTFOLIO_SETTINGS_KEY)
    .maybeSingle();
  if (error) throw error;
  return parseGlobalSettings(data?.value);
}

export function isPortfolioRequirementBlocking(status: PortfolioRequirementStatus): boolean {
  return status.enabled && !status.waived && !status.can_withdraw;
}

export function portfolioProgressPercent(status: PortfolioRequirementStatus): number {
  if (!status.enabled || status.requirement <= 0) return 100;
  return Math.min(100, Math.round((status.deposit_total / status.requirement) * 100));
}
