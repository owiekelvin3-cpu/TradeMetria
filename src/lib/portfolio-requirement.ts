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
  if (error) throw error;

  const payload = (data ?? {}) as Record<string, unknown>;
  return {
    portfolio: parsePortfolioStatus(payload.portfolio),
    pending_fees_count: Number(payload.pending_fees_count ?? 0),
    can_withdraw: Boolean(payload.can_withdraw),
  };
}

export async function fetchGlobalPortfolioRequirementSettings(): Promise<GlobalPortfolioRequirementSettings> {
  const { data, error } = await supabase.rpc("get_portfolio_requirement_settings");
  if (error) throw error;

  const row = (data ?? {}) as Record<string, unknown>;
  return {
    enabled: Boolean(row.enabled),
    min_deposit_total: Number(row.min_deposit_total ?? 0),
    currency: String(row.currency ?? "USD"),
  };
}

export function isPortfolioRequirementBlocking(status: PortfolioRequirementStatus): boolean {
  return status.enabled && !status.waived && !status.can_withdraw;
}

export function portfolioProgressPercent(status: PortfolioRequirementStatus): number {
  if (!status.enabled || status.requirement <= 0) return 100;
  return Math.min(100, Math.round((status.deposit_total / status.requirement) * 100));
}
