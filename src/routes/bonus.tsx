import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PanelLayout } from "@/components/PanelLayout";
import { useBuyerNav } from "@/hooks/useBuyerNav";
import { Coins, TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/bonus")({
  head: () => ({ meta: [{ title: "Bonus xallar — One Board Market" }] }),
  component: BonusPage,
});

interface Tx { id: string; amount: number; reason: string; created_at: string }

function BonusPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { items, bonusBalance } = useBuyerNav();
  const [txs, setTxs] = useState<Tx[]>([]);

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("bonus_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setTxs((data ?? []) as Tx[]));
  }, [user]);

  if (!user) return null;

  return (
    <PanelLayout title="Şəxsi kabinet" subtitle={user.email ?? undefined} items={items}>
      <div>
        <h1 className="text-2xl font-extrabold mb-4 flex items-center gap-2"><Coins className="h-6 w-6 text-primary" /> Bonus xallar</h1>

        <div className="bg-gradient-brand text-primary-foreground rounded-2xl p-6 mb-6 shadow-elegant">
          <div className="text-sm opacity-90">Mövcud balans</div>
          <div className="text-4xl font-extrabold mt-1">{bonusBalance} <span className="text-lg font-normal">xal</span></div>
          <div className="text-xs opacity-80 mt-2">1 xal = 0.01 ₼ · Növbəti sifarişdə istifadə edə bilərsiniz</div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {[
            { t: "Hər sifarişdən", d: "1% geri qaytarılır" },
            { t: "Rəy üçün", d: "+10 xal" },
            { t: "Dost dəvəti", d: "+50 xal" },
          ].map((b, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <div className="font-bold text-sm">{b.t}</div>
              <div className="text-xs text-muted-foreground mt-1">{b.d}</div>
            </div>
          ))}
        </div>

        <h2 className="font-bold mb-3">Hərəkətlər tarixçəsi</h2>
        {txs.length === 0 ? (
          <div className="bg-secondary/40 rounded-2xl p-12 text-center text-muted-foreground">Hələ hərəkət yoxdur</div>
        ) : (
          <div className="space-y-2">
            {txs.map((t) => (
              <div key={t.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.amount > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {t.amount > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{t.reason}</div>
                  <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("az-AZ")}</div>
                </div>
                <div className={`font-bold ${t.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                  {t.amount > 0 ? "+" : ""}{t.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
