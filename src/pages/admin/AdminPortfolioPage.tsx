import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  fetchGlobalPortfolioRequirementSettings,
  type GlobalPortfolioRequirementSettings,
} from "@/lib/portfolio-requirement";
import { setGlobalPortfolioRequirement } from "@/lib/admin-api";
import { formatCurrency } from "@/lib/utils";

export default function AdminPortfolioPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<GlobalPortfolioRequirementSettings | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [minDepositTotal, setMinDepositTotal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchGlobalPortfolioRequirementSettings();
      setSettings(data);
      setEnabled(data.enabled);
      setMinDepositTotal(data.min_deposit_total > 0 ? String(data.min_deposit_total) : "");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.portfolio.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const amount = parseFloat(minDepositTotal);
    const hasAmount = Number.isFinite(amount) && amount > 0;
    if (enabled && !hasAmount) {
      setError(t("admin.portfolio.invalidAmount"));
      return;
    }

    setSaving(true);
    try {
      const saved = await setGlobalPortfolioRequirement({
        enabled: hasAmount,
        minDepositTotal: hasAmount ? amount : 0,
      });
      setSettings(saved);
      setEnabled(saved.enabled);
      setMinDepositTotal(saved.min_deposit_total > 0 ? String(saved.min_deposit_total) : "");
      setMessage(t("admin.portfolio.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.portfolio.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("admin.portfolio.title")}
        subtitle={t("admin.portfolio.subtitle")}
      />

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <AdminPanel title={t("admin.portfolio.globalTitle")}>
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            <p className="mb-4 text-sm leading-relaxed text-muted">
              {t("admin.portfolio.globalDesc")}
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <label className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    {t("admin.portfolio.enableGlobal")}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {t("admin.portfolio.enableGlobalHint")}
                  </span>
                </span>
              </label>

              <div>
                <Label htmlFor="portfolio-min">{t("admin.portfolio.minDeposits")}</Label>
                <Input
                  id="portfolio-min"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={minDepositTotal}
                  onChange={(e) => setMinDepositTotal(e.target.value)}
                  disabled={!enabled}
                  className="mt-2"
                  placeholder="10000"
                />
                <p className="mt-1.5 text-xs text-muted">{t("admin.portfolio.minDepositsHint")}</p>
              </div>

              {settings && enabled && settings.min_deposit_total > 0 && (
                <p className="text-sm text-muted">
                  {t("admin.portfolio.currentGlobal", {
                    amount: formatCurrency(settings.min_deposit_total),
                  })}
                </p>
              )}

              <Button type="submit" disabled={saving}>
                {saving ? t("admin.portfolio.saving") : t("admin.save")}
              </Button>
              {message && <p className="text-sm text-emerald">{message}</p>}
            </form>
          </>
        )}
      </AdminPanel>

      <AdminPanel title={t("admin.portfolio.perUserTitle")}>
        <p className="text-sm leading-relaxed text-muted">
          {t("admin.portfolio.perUserDesc")}
        </p>
      </AdminPanel>
    </div>
  );
}
