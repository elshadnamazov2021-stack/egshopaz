import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatAZN } from "@/lib/format";
import { Check, Crown, Sparkles, Star, CreditCard, Calendar, TrendingUp, Receipt, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Pkg {
  id: string;
  name: string;
  tier: string;
  price: number;
  duration_days: number;
  banner_slots: number;
  sponsored_product_slots: number;
  features: string[];
  color: string;
}
interface Sub {
  id: string;
  package_id: string;
  starts_at: string;
  ends_at: string;
  payment_status: string;
  amount: number;
  is_active: boolean;
  ad_packages?: Pkg | null;
}
interface Tx {
  id: string;
  amount: number;
  status: string;
  method: string;
  description: string | null;
  created_at: string;
}

const TIER_ICONS: Record<string, typeof Crown> = {
  premium: Sparkles,
  gold: Star,
  vip: Crown,
};

export function SellerAdvertising() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<Pkg | null>(null);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [pk, sb, tx] = await Promise.all([
      supabase.from("ad_packages").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("seller_subscriptions").select("*, ad_packages(*)").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("payment_transactions").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setPackages((pk.data ?? []) as unknown as Pkg[]);
    setSubs((sb.data ?? []) as unknown as Sub[]);
    setTxs((tx.data ?? []) as unknown as Tx[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [user]);

  const activeSub = subs.find((s) => s.is_active && new Date(s.ends_at) > new Date());

  const purchase = async () => {
    if (!user || !checkout) return;
    if (!card.number || !card.name || !card.expiry || !card.cvc) {
      toast.error("Bütün kart məlumatlarını doldurun");
      return;
    }
    setPaying(checkout.id);
    try {
      const ends = new Date();
      ends.setDate(ends.getDate() + checkout.duration_days);

      const { data: sub, error: subErr } = await supabase.from("seller_subscriptions").insert({
        seller_id: user.id,
        package_id: checkout.id,
        ends_at: ends.toISOString(),
        amount: checkout.price,
        payment_status: "completed",
        payment_method: "mock_card",
        is_active: true,
      }).select().single();
      if (subErr) throw subErr;

      await supabase.from("payment_transactions").insert({
        seller_id: user.id,
        subscription_id: sub.id,
        amount: checkout.price,
        status: "completed",
        method: "mock_card",
        description: `${checkout.name} paketi (${checkout.duration_days} gün)`,
      });

      toast.success(`${checkout.name} paketi aktiv edildi! 🎉`);
      setCheckout(null);
      setCard({ number: "", name: "", expiry: "", cvc: "" });
      await load();
    } catch (e) {
      toast.error("Ödəniş alınmadı: " + (e as Error).message);
    } finally {
      setPaying(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Active subscription */}
      {activeSub && activeSub.ad_packages && (
        <div className="rounded-2xl p-6 border-2" style={{ borderColor: activeSub.ad_packages.color, background: `linear-gradient(135deg, ${activeSub.ad_packages.color}15, transparent)` }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Aktiv paket</div>
              <div className="flex items-center gap-2 mt-1">
                {(() => { const I = TIER_ICONS[activeSub.ad_packages.tier] ?? Crown; return <I className="h-6 w-6" style={{ color: activeSub.ad_packages.color }} />; })()}
                <h3 className="text-2xl font-extrabold">{activeSub.ad_packages.name}</h3>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Bitir</div>
              <div className="font-bold flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(activeSub.ends_at).toLocaleDateString("az-AZ")}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            <div className="bg-card/60 rounded-xl p-3"><div className="text-xs text-muted-foreground">Banner yerləri</div><div className="font-bold text-lg">{activeSub.ad_packages.banner_slots}</div></div>
            <div className="bg-card/60 rounded-xl p-3"><div className="text-xs text-muted-foreground">Sponsor məhsul</div><div className="font-bold text-lg">{activeSub.ad_packages.sponsored_product_slots}</div></div>
            <div className="bg-card/60 rounded-xl p-3"><div className="text-xs text-muted-foreground">Müddət</div><div className="font-bold text-lg">{activeSub.ad_packages.duration_days} gün</div></div>
          </div>
        </div>
      )}

      {/* Packages */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Reklam paketləri</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {packages.map((p) => {
            const Icon = TIER_ICONS[p.tier] ?? Crown;
            const isActive = activeSub?.package_id === p.id;
            return (
              <div key={p.id} className="rounded-2xl p-6 border-2 bg-card relative overflow-hidden transition hover:shadow-lg" style={{ borderColor: isActive ? p.color : "hsl(var(--border))" }}>
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10" style={{ background: p.color }} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-6 w-6" style={{ color: p.color }} />
                    <h3 className="text-2xl font-extrabold">{p.name}</h3>
                  </div>
                  <div className="text-3xl font-extrabold mb-1" style={{ color: p.color }}>{formatAZN(p.price)}</div>
                  <div className="text-xs text-muted-foreground mb-4">{p.duration_days} gün</div>
                  <ul className="space-y-2 mb-5">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: p.color }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    disabled={isActive}
                    onClick={() => setCheckout(p)}
                    className="w-full py-2.5 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition hover:opacity-90"
                    style={{ background: p.color }}
                  >
                    {isActive ? "✓ Aktiv" : "Al"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Ödəniş tarixçəsi</h2>
        </div>
        {txs.length === 0 ? (
          <div className="text-center text-muted-foreground py-6 text-sm">Hələ ödəniş yoxdur</div>
        ) : (
          <div className="divide-y divide-border">
            {txs.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-semibold text-sm">{t.description ?? "Ödəniş"}</div>
                  <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("az-AZ")} • {t.method}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatAZN(t.amount)}</div>
                  <div className={`text-xs ${t.status === "completed" ? "text-success" : "text-warning"}`}>{t.status === "completed" ? "Tamamlandı" : t.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout modal (mock) */}
      {checkout && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !paying && setCheckout(null)}>
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ödəniş — {checkout.name}
              </h3>
              <button onClick={() => !paying && setCheckout(null)} className="p-1 hover:bg-secondary rounded"><X className="h-5 w-5" /></button>
            </div>
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4 text-xs">
              ⚠️ <strong>Demo rejimi:</strong> Real ödəniş baş vermir. İstənilən test kartı işləyir.
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Kart nömrəsi</label>
                <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Kart sahibi</label>
                <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="ALI MAMMADOV" className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Bitir</label>
                  <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="12/28" className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">CVC</label>
                  <input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="123" maxLength={4} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
              <div>
                <div className="text-xs text-muted-foreground">Ödənilən məbləğ</div>
                <div className="text-2xl font-extrabold" style={{ color: checkout.color }}>{formatAZN(checkout.price)}</div>
              </div>
              <button onClick={purchase} disabled={!!paying} className="px-6 py-3 rounded-xl font-bold text-white disabled:opacity-60" style={{ background: checkout.color }}>
                {paying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Ödə"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
