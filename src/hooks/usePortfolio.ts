import { useCallback, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ensureValidSession } from "@/lib/auth-session";
import { fetchUserTransactions, type UserTransaction } from "@/lib/transactions";
import {
  fetchWithdrawalEligibility,
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

export function usePortfolio(userId: string | undefined) {
  const [data, setData] = useState<PortfolioSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (soft = false) => {
    if (!userId) return;
    if (soft) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      await ensureValidSession();
      const [balRes, depRes, txList, tradesRes, aiRes, eligibility] = await Promise.all([
        supabase.from("balances").select("amount").eq("user_id", userId).single(),
        supabase.from("deposits").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        fetchUserTransactions(userId),
        supabase.from("trades").select("id, status").eq("user_id", userId),
        supabase.from("ai_trading_subscriptions").select("id, status").eq("user_id", userId),
        fetchWithdrawalEligibility(),
      ]);

      if (balRes.error && balRes.error.code !== "PGRST116") throw balRes.error;
      if (depRes.error) throw depRes.error;

      const balance = Number(balRes.data?.amount ?? 0);
      const deposits = depRes.data ?? [];
      const transactions = txList;

      const totalDeposits = deposits
        .filter((d) => isSettled(d.status))
        .reduce((sum, d) => sum + Number(d.amount), 0);

      const totalWithdrawals = transactions
        .filter((tx) => tx.kind === "withdrawal" && isSettled(String(tx.status)))
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      const pendingDeposits = deposits
        .filter((d) => d.status === "pending")
        .reduce((sum, d) => sum + Number(d.amount), 0);

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
        portfolioStatus: eligibility.portfolio,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

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
