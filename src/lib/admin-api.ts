import { supabase } from "@/lib/supabase";
import type { Profile, TransactionStatus, UserFee, UserFeeStatus } from "@/types/database";
import type { GlobalPortfolioRequirementSettings, PortfolioRequirementStatus } from "@/lib/portfolio-requirement";
import { computePortfolioStatus, fetchGlobalPortfolioRequirementSettings } from "@/lib/portfolio-requirement";

export interface AdminUserAuthInfo {
  created_at: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  phone: string | null;
  has_password: boolean;
  providers: string[];
}

export interface AdminUserStats {
  deposits_count: number;
  deposits_total: number;
  withdrawals_count: number;
  withdrawals_total: number;
  trades_count: number;
  active_trades: number;
  ai_bots_active: number;
}

export type AdminModerationActionType =
  | "suspend"
  | "unsuspend"
  | "reset_kyc"
  | "note"
  /** Kept for historical moderation log rows only — no longer callable from the UI. */
  | "make_admin"
  | "demote";

/** Actions that can be triggered from the admin UI. Role promotion is disabled. */
export type AdminModerationUiAction = "suspend" | "unsuspend" | "reset_kyc" | "note";

export interface AdminModerationAction {
  id: string;
  action_type: AdminModerationActionType;
  reason: string;
  created_at: string;
  admin_id: string;
  admin_email: string | null;
  admin_name: string | null;
}

export type AdminBalanceDirection = "credit" | "debit";

export interface AdminBalanceAdjustment {
  id: string;
  direction: AdminBalanceDirection;
  amount: number;
  balance_before: number;
  balance_after: number;
  reason: string;
  created_at: string;
  admin_id: string;
  admin_email: string | null;
  admin_name: string | null;
}

export interface AdminUserDetails {
  profile: Profile;
  balance: number;
  outstanding_fees_total: number;
  portfolio: PortfolioRequirementStatus;
  auth: AdminUserAuthInfo;
  stats: AdminUserStats;
  fees: UserFee[];
  balance_adjustments: AdminBalanceAdjustment[];
  recent_deposits: Array<{ id: string; amount: number; method: string; status: string; created_at: string }>;
  recent_withdrawals: Array<{ id: string; amount: number; method: string; status: string; wallet_address: string | null; created_at: string }>;
  kyc_submissions: Array<{
    id: string;
    document_type: string;
    document_url: string | null;
    selfie_url: string | null;
    face_captured_at: string | null;
    status: string;
    notes: string | null;
    created_at: string;
  }>;
  moderation_actions: AdminModerationAction[];
}

export async function fetchAdminUserDetails(userId: string): Promise<AdminUserDetails> {
  const { data, error } = await supabase.rpc("admin_get_user_details", { p_user_id: userId });
  if (error) throw error;
  const details = data as AdminUserDetails;
  return {
    ...details,
    outstanding_fees_total: Number(details.outstanding_fees_total ?? 0),
    portfolio: details.portfolio ?? {
      enabled: false,
      waived: false,
      source: "none",
      requirement: 0,
      deposit_total: 0,
      remaining: 0,
      currency: "USD",
      can_withdraw: true,
    },
    fees: details.fees ?? [],
    balance_adjustments: details.balance_adjustments ?? [],
    moderation_actions: details.moderation_actions ?? [],
  };
}

function rpcErrorMessage(error: { message?: string; details?: string; hint?: string } | null, fallback: string) {
  if (!error) return fallback;
  return [error.message, error.details, error.hint].filter(Boolean).join(" — ") || fallback;
}

export async function deleteAdminUser(params: { userId: string; reason: string }) {
  const { data, error } = await supabase.rpc("admin_delete_user", {
    p_user_id: params.userId,
    p_reason: params.reason.trim(),
  });
  if (error) throw new Error(rpcErrorMessage(error, "Could not delete user."));
  return data as { ok: boolean; user_id: string; email: string };
}

export async function moderateAdminUser(params: {
  userId: string;
  action: AdminModerationUiAction;
  reason?: string;
}) {
  const reason =
    params.action === "unsuspend" && (!params.reason || params.reason.trim().length < 3)
      ? "Suspension lifted by administrator"
      : (params.reason ?? "").trim();

  const { data, error } = await supabase.rpc("admin_moderate_user", {
    p_user_id: params.userId,
    p_action: params.action,
    p_reason: reason,
  });
  if (error) throw new Error(rpcErrorMessage(error, "Could not complete that action."));
  return data;
}

export async function adjustAdminUserBalance(params: {
  userId: string;
  direction: AdminBalanceDirection;
  amount: number;
  reason: string;
}) {
  const { data, error } = await supabase.rpc("admin_adjust_user_balance", {
    p_user_id: params.userId,
    p_direction: params.direction,
    p_amount: params.amount,
    p_reason: params.reason.trim(),
  });
  if (error) throw new Error(rpcErrorMessage(error, "Could not adjust balance."));
  return data as {
    ok: boolean;
    id: string;
    direction: AdminBalanceDirection;
    amount: number;
    balance_before: number;
    balance_after: number;
    reason: string;
    created_at: string;
  };
}

export async function assignUserFee(params: {
  userId: string;
  feeType: string;
  label: string;
  amount: number;
  notes?: string;
}): Promise<UserFee> {
  const { data, error } = await supabase.rpc("admin_assign_user_fee", {
    p_user_id: params.userId,
    p_fee_type: params.feeType,
    p_label: params.label,
    p_amount: params.amount,
    p_notes: params.notes ?? null,
  });
  if (error) throw error;
  return data as UserFee;
}

export async function updateUserFeeStatus(
  feeId: string,
  status: Extract<UserFeeStatus, "paid" | "waived" | "cancelled">
): Promise<UserFee> {
  const { data, error } = await supabase.rpc("admin_update_user_fee_status", {
    p_fee_id: feeId,
    p_status: status,
  });
  if (error) throw error;
  return data as UserFee;
}

export async function updateAdminUserProfile(
  userId: string,
  fields: Partial<Pick<Profile, "country" | "city" | "timezone" | "last_known_ip" | "last_known_location" | "full_name" | "phone" | "bio" | "kyc_status">>
) {
  const { error } = await supabase.from("profiles").update(fields).eq("id", userId);
  if (error) throw error;
}

export async function sendUserPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth`,
  });
  if (error) throw error;
}

export async function approveDeposit(depositId: string, userId: string, amount: number) {
  const { error: depErr } = await supabase
    .from("deposits")
    .update({ status: "completed" as TransactionStatus })
    .eq("id", depositId);
  if (depErr) throw depErr;

  const [{ data: bal }, { data: profile }] = await Promise.all([
    supabase.from("balances").select("amount, currency").eq("user_id", userId).single(),
    supabase.from("profiles").select("preferred_currency").eq("id", userId).single(),
  ]);
  const currency = bal?.currency || profile?.preferred_currency || "USD";
  const newAmount = (bal?.amount ?? 0) + amount;
  const { error: balErr } = await supabase
    .from("balances")
    .upsert({ user_id: userId, amount: newAmount, currency }, { onConflict: "user_id" });
  if (balErr) throw balErr;

  // Settle outstanding withdrawal fees using only this deposit's amount (not prior balance).
  const { error: settleErr } = await supabase.rpc("settle_pending_fees_from_deposit", {
    p_deposit_id: depositId,
  });
  if (settleErr) throw settleErr;
}

export async function rejectDeposit(depositId: string) {
  const { error } = await supabase
    .from("deposits")
    .update({ status: "rejected" as TransactionStatus })
    .eq("id", depositId);
  if (error) throw error;
}

export async function completeWithdrawal(withdrawalId: string, _userId: string, _amount: number) {
  // Balance was already held on insert via hold_balance_for_withdrawal — only flip status.
  const { error: wErr } = await supabase
    .from("withdrawals")
    .update({ status: "completed" as TransactionStatus })
    .eq("id", withdrawalId);
  if (wErr) throw wErr;
}

export async function rejectWithdrawal(withdrawalId: string) {
  const { error } = await supabase
    .from("withdrawals")
    .update({ status: "rejected" as TransactionStatus })
    .eq("id", withdrawalId);
  if (error) throw error;
}

export async function fetchAdminProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function setGlobalPortfolioRequirement(params: {
  enabled: boolean;
  minDepositTotal: number;
  currency?: string;
}): Promise<GlobalPortfolioRequirementSettings> {
  const value = {
    enabled: params.enabled,
    min_deposit_total: Math.max(params.minDepositTotal, 0),
    currency: params.currency ?? "USD",
  };
  const { error } = await supabase.from("platform_settings").upsert(
    {
      key: "withdrawal_portfolio_requirement",
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
  if (error) throw new Error(rpcErrorMessage(error, "Could not save portfolio requirement."));
  return {
    enabled: value.enabled,
    min_deposit_total: value.min_deposit_total,
    currency: value.currency,
  };
}

export async function setUserPortfolioRequirement(params: {
  userId: string;
  override?: number | null;
  waived?: boolean;
  clearOverride?: boolean;
}): Promise<PortfolioRequirementStatus> {
  const updates: Partial<Pick<Profile, "portfolio_requirement_override" | "portfolio_requirement_waived">> = {};

  if (params.clearOverride) {
    updates.portfolio_requirement_override = null;
  } else if (params.override != null) {
    updates.portfolio_requirement_override = params.override;
  }

  if (params.waived != null) {
    updates.portfolio_requirement_waived = params.waived;
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", params.userId);
  if (error) throw new Error(rpcErrorMessage(error, "Could not update user portfolio requirement."));

  const [global, depositsRes, profileRes] = await Promise.all([
    fetchGlobalPortfolioRequirementSettings(),
    supabase.from("deposits").select("amount, status").eq("user_id", params.userId),
    supabase
      .from("profiles")
      .select("portfolio_requirement_override, portfolio_requirement_waived")
      .eq("id", params.userId)
      .single(),
  ]);
  if (depositsRes.error) throw new Error(depositsRes.error.message);
  if (profileRes.error) throw new Error(profileRes.error.message);

  const depositTotal = (depositsRes.data ?? [])
    .filter((d) => d.status === "completed" || d.status === "approved")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  return computePortfolioStatus({
    global,
    override: profileRes.data?.portfolio_requirement_override ?? null,
    waived: Boolean(profileRes.data?.portfolio_requirement_waived),
    depositTotal,
  });
}
