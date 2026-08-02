import { useCallback, useState } from "react";
import i18n from "@/i18n";
import { supabase } from "@/lib/supabase";
import { ensureValidSession, withValidSession } from "@/lib/auth-session";
import { fetchOutstandingFees, sumOutstandingFees } from "@/lib/fees";
import {
  isPortfolioRequirementBlocking,
  resolveWithdrawalEligibility,
  type PortfolioRequirementStatus,
} from "@/lib/portfolio-requirement";
import { formatTransactionError } from "@/lib/kyc";
import type { UserFee, Withdrawal } from "@/types/database";

export type WithdrawalFilter = "crypto" | "bank_transfer" | "wire_transfer" | "ewallet";

function matchesFilter(method: string, filter?: WithdrawalFilter) {
  if (!filter) return true;
  if (filter === "crypto") return method.startsWith("crypto_");
  if (filter === "ewallet") return method.startsWith("ewallet_");
  return method === filter;
}

const defaultPortfolioStatus: PortfolioRequirementStatus = {
  enabled: false,
  waived: false,
  source: "none",
  requirement: 0,
  deposit_total: 0,
  remaining: 0,
  currency: "USD",
  can_withdraw: true,
};

export function useWithdrawalData(filter?: WithdrawalFilter) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState(0);
  const [outstandingFees, setOutstandingFees] = useState<UserFee[]>([]);
  const [portfolioStatus, setPortfolioStatus] = useState<PortfolioRequirementStatus>(defaultPortfolioStatus);

  const load = useCallback(async (userId: string) => {
    await withValidSession(async () => {
      const [wRes, bRes, fees, eligibility] = await Promise.all([
        supabase
          .from("withdrawals")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("balances").select("amount").eq("user_id", userId).maybeSingle(),
        fetchOutstandingFees(userId).catch(() => [] as UserFee[]),
        resolveWithdrawalEligibility(userId),
      ]);

      const all = wRes.data ?? [];
      setWithdrawals(filter ? all.filter((w) => matchesFilter(w.method, filter)) : all);
      setBalance(Number(bRes.data?.amount ?? 0));
      setOutstandingFees(fees);
      setPortfolioStatus(eligibility.portfolio);
    });
  }, [filter]);

  const outstandingTotal = sumOutstandingFees(outstandingFees);
  const hasOutstandingFees = outstandingFees.length > 0;
  const hasPortfolioRequirementPending = isPortfolioRequirementBlocking(portfolioStatus);
  const canSubmitWithdrawal = !hasOutstandingFees && !hasPortfolioRequirementPending;

  return {
    withdrawals,
    balance,
    outstandingFees,
    outstandingTotal,
    hasOutstandingFees,
    portfolioStatus,
    hasPortfolioRequirementPending,
    canSubmitWithdrawal,
    load,
  };
}

export function useWithdrawalForm(
  userId: string | undefined,
  load: (id: string) => Promise<void>,
  canSubmitWithdrawal = true,
  hasOutstandingFees = false,
  hasPortfolioRequirementPending = false,
) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (data: {
    amount: number;
    method: string;
    wallet_address?: string | null;
    notes?: string | null;
  }) => {
    if (!userId) return false;
    if (hasOutstandingFees) {
      setMessage(i18n.t("withdrawals.feesBlockMessage"));
      return false;
    }
    if (hasPortfolioRequirementPending) {
      setMessage(i18n.t("withdrawals.portfolioBlockMessage"));
      return false;
    }
    if (!canSubmitWithdrawal) {
      setMessage(i18n.t("withdrawals.withdrawalBlocked"));
      return false;
    }
    if (!data.amount || data.amount <= 0) {
      setMessage("Invalid amount");
      return false;
    }

    setLoading(true);
    setMessage("");
    setSuccess(false);

    await ensureValidSession();

    const eligibility = await resolveWithdrawalEligibility(userId);
    if (isPortfolioRequirementBlocking(eligibility.portfolio)) {
      setMessage(i18n.t("withdrawals.portfolioBlockMessage"));
      setLoading(false);
      return false;
    }
    if (eligibility.pending_fees_count > 0) {
      setMessage(i18n.t("withdrawals.feesBlockMessage"));
      setLoading(false);
      return false;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("kyc_status")
      .eq("id", userId)
      .single();
    if (profile?.kyc_status !== "approved") {
      setMessage(i18n.t("kyc.required"));
      setLoading(false);
      return false;
    }

    const { error } = await supabase.from("withdrawals").insert({
      user_id: userId,
      amount: data.amount,
      method: data.method,
      wallet_address: data.wallet_address ?? null,
      notes: data.notes ?? null,
      status: "pending",
    });

    if (error) {
      setMessage(formatTransactionError(error, error.message, i18n.t("kyc.required")));
    } else {
      setSuccess(true);
      await load(userId);
    }
    setLoading(false);
    return !error;
  };

  return { loading, message, success, setMessage, submit };
}
