import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatAuthError, getErrorMessage, withValidSession } from "@/lib/auth-session";
import { fetchUserTransactions, type UserTransaction } from "@/lib/transactions";
import {
  defaultWithdrawalEligibility,
  fetchPortfolioStatusForUser,
  fetchWithdrawalEligibility,
  syncPortfolioStatusWithDeposits,
  type PortfolioRequirementStatus,
  type WithdrawalEligibility,
} from "@/lib/portfolio-requirement";
import type { Deposit } from "@/types/database";

function isSettled(status: string) {
  return status === "completed" || status === "approved";
}

export interface PortfolioChartPoint {
  label: string;
  value: number;
  at: string;
}

export interface PortfolioSnapshot {
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  netContributions: number;
  tradingProfit: number;
  profitPercent: number;
  activeTrades: number;
  activeAiBots: number;
  pendingDeposits: number;
  chartData: PortfolioChartPoint[];
  deposits: Deposit[];
  transactions: UserTransaction[];
  eligibility: WithdrawalEligibility | null;
  portfolioStatus: PortfolioRequirementStatus | null;
}

const PORTFOLIO_LOAD_ERROR = "We couldn't load your portfolio. Please try again.";

export function usePortfolio(userId: string | undefined, authReady = true) {
  const [data, setData] = useState<PortfolioSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (soft = false) => {
    if (!authReady || !userId) return;
    if (soft) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [balRes, depRes, txList, tradesRes, aiRes] = await withValidSession(() =>
        Promise.all([
          supabase.from("balances").select("amount").eq("user_id", userId).maybeSingle(),
          supabase.from("deposits").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
          fetchUserTransactions(userId).catch(() => [] as UserTransaction[]),
          supabase.from("trades").select("id, status").eq("user_id", userId),
          supabase.from("ai_trading_subscriptions").select("id, status").eq("user_id", userId),
        ])
      );

      const loadErrors: string[] = [];
      if (balRes.error) {
        loadErrors.push(formatAuthError(balRes.error, PORTFOLIO_LOAD_ERROR));
      }
      if (depRes.error) {
        loadErrors.push(formatAuthError(depRes.error, PORTFOLIO_LOAD_ERROR));
      }

      const balance = Number(balRes.data?.amount ?? 0);
      const deposits = depRes.data ?? [];
      const transactions = txList;

      if (loadErrors.length === 2) {
        throw new Error(loadErrors[0] || PORTFOLIO_LOAD_ERROR);
      }

      const totalDeposits = deposits
        .filter((d) => isSettled(d.status))
        .reduce((sum, d) => sum + Number(d.amount), 0);

      const totalWithdrawals = transactions
        .filter((tx) => tx.kind === "withdrawal" && isSettled(String(tx.status)))
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      const pendingDeposits = deposits
        .filter((d) => d.status === "pending")
        .reduce((sum, d) => sum + Number(d.amount), 0);

      let eligibility: WithdrawalEligibility = defaultWithdrawalEligibility;
      try {
        const portfolio = await fetchPortfolioStatusForUser(userId, totalDeposits);
        eligibility = {
          portfolio,
          pending_fees_count: 0,
          can_withdraw: portfolio.can_withdraw,
        };
        try {
          const rpcEligibility = await fetchWithdrawalEligibility();
          eligibility = {
            portfolio: syncPortfolioStatusWithDeposits(rpcEligibility.portfolio, totalDeposits) ?? portfolio,
            pending_fees_count: rpcEligibility.pending_fees_count,
            can_withdraw:
              (syncPortfolioStatusWithDeposits(rpcEligibility.portfolio, totalDeposits)?.can_withdraw ??
                portfolio.can_withdraw) && rpcEligibility.pending_fees_count === 0,
          };
        } catch {
          // RPC fees count optional; portfolio totals already synced from deposits.
        }
      } catch {
        eligibility = {
          ...defaultWithdrawalEligibility,
          portfolio: {
            ...defaultWithdrawalEligibility.portfolio,
            deposit_total: totalDeposits,
          },
        };
      }

      const netContributions = totalDeposits - totalWithdrawals;
      const tradingProfit = balance - netContributions;
      const profitPercent =
        netContributions > 0 ? (tradingProfit / netContributions) * 100 : tradingProfit > 0 ? 100 : 0;

      const activeTrades =
        tradesRes.data?.filter((t) => t.status === "active" || t.status === "pending").length ?? 0;

      const activeAiBots = aiRes.data?.filter((b) => b.status === "active").length ?? 0;

      const events = [
        ...deposits
          .filter((d) => isSettled(d.status))
          .map((d) => ({ at: d.created_at, delta: Number(d.amount), kind: "deposit" as const })),
        ...transactions
          .filter((tx) => tx.kind === "withdrawal" && isSettled(String(tx.status)))
          .map((tx) => ({ at: tx.created_at, delta: -Number(tx.amount), kind: "withdrawal" as const })),
      ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

      let chartData: PortfolioChartPoint[] = [];
      if (events.length === 0) {
        const v = Math.max(balance, 0);
        chartData = [
          { label: "Start", value: v, at: new Date().toISOString() },
          { label: "Now", value: v, at: new Date().toISOString() },
        ];
      } else {
        const net = events.reduce((sum, e) => sum + e.delta, 0);
        let running = Math.max(0, balance - net);
        chartData = events.map((e, i) => {
          running = Math.max(0, running + e.delta);
          return {
            label: `#${i + 1}`,
            value: Math.round(running * 100) / 100,
            at: e.at,
          };
        });
        if (chartData.length > 0) {
          chartData[chartData.length - 1].value = Math.round(balance * 100) / 100;
        }
        chartData.push({
          label: "Now",
          value: Math.round(balance * 100) / 100,
          at: new Date().toISOString(),
        });
      }

      setData({
        balance,
        totalDeposits,
        totalWithdrawals,
        netContributions,
        tradingProfit,
        profitPercent,
        activeTrades,
        activeAiBots,
        pendingDeposits,
        chartData,
        deposits,
        transactions,
        eligibility,
        portfolioStatus: syncPortfolioStatusWithDeposits(eligibility.portfolio, totalDeposits),
      });
      setError(loadErrors[0] ?? "");
    } catch (err) {
      const message = getErrorMessage(err).trim();
      setError(message || PORTFOLIO_LOAD_ERROR);
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authReady, userId]);

  useEffect(() => {
    if (!authReady) {
      setLoading(true);
      return;
    }
    if (!userId) {
      setLoading(false);
      setData(null);
      return;
    }
    void load();
  }, [authReady, userId, load]);

  useEffect(() => {
    if (!authReady || !userId) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") void load(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [authReady, userId, load]);

  useEffect(() => {
    if (!authReady || !userId) return;

    const channel = supabase
      .channel(`portfolio-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deposits", filter: `user_id=eq.${userId}` },
        () => {
          void load(true);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "balances", filter: `user_id=eq.${userId}` },
        () => {
          void load(true);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authReady, userId, load]);

  const allocation = useMemo(() => {
    if (!data || data.balance <= 0) {
      return { depositShare: 0, profitShare: 0 };
    }
    const depositBase = Math.min(data.totalDeposits, data.balance);
    const profitBase = Math.max(0, data.balance - depositBase);
    const depositShare = Math.round((depositBase / data.balance) * 100);
    const profitShare = Math.round((profitBase / data.balance) * 100);
    return { depositShare, profitShare };
  }, [data]);

  return { data, allocation, loading, refreshing, error, load };
}
