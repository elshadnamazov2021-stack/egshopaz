import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PanelLayout } from "@/components/PanelLayout";
import { useBuyerNav } from "@/hooks/useBuyerNav";
import { CreditCard, Plus, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/payment-methods")({
  head: () => ({ meta: [{ title: "Ödəniş üsulları — One Board Market" }] }),
  component: PaymentMethodsPage,
});

interface SavedCard { id: string; brand: string; last4: string; exp: string; holder: string }

function PaymentMethodsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { items } = useBuyerNav();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ number: "", exp: "", cvv: "", holder: "" });

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const raw = localStorage.getItem(`obm_cards_${user.id}`);
    if (raw) try { setCards(JSON.parse(raw)); } catch { /* ignore */ }
  }, [user]);

  const persist = (next: SavedCard[]) => {
    setCards(next);
    if (user) localStorage.setItem(`obm_cards_${user.id}`, JSON.stringify(next));
  };

  const addCard = () => {
    const num = form.number.replace(/\s/g, "");
    if (num.length < 13 || num.length > 19) { toast.error("Kart nömrəsi yanlışdır"); return; }
    if (!/^\d{2}\/\d{2}$/.test(form.exp)) { toast.error("Etibar tarixi MM/YY formatında olmalıdır"); return; }
    if (form.cvv.length < 3) { toast.error("CVV yanlışdır"); return; }
    const brand = num.startsWith("4") ? "Visa" : num.startsWith("5") ? "MasterCard" : "Card";
    const card: SavedCard = { id: crypto.randomUUID(), brand, last4: num.slice(-4), exp: form.exp, holder: form.holder.toUpperCase().slice(0, 50) };
    persist([...cards, card]);
    setForm({ number: "", exp: "", cvv: "", holder: "" });
    setAdding(false);
    toast.success("Kart əlavə edildi");
  };

  const remove = (id: string) => {
    if (!confirm("Kartı silmək istəyirsiniz?")) return;
    persist(cards.filter((c) => c.id !== id));
  };

  if (!user) return null;

  return (
    <PanelLayout title="Şəxsi kabinet" subtitle={user.email ?? undefined} items={items}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold flex items-center gap-2"><CreditCard className="h-6 w-6 text-primary" /> Ödəniş üsulları</h1>
          <button onClick={() => setAdding(true)} className="bg-primary text-primary-foreground px-4 h-10 rounded-lg font-bold hover:bg-primary/90 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Yeni kart
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-xl p-3 text-sm mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 shrink-0" /> Real ödəniş hələ aktiv deyil. Kart məlumatları yalnız bu cihazda saxlanılır (test rejimi).
        </div>

        {cards.length === 0 ? (
          <div className="bg-secondary/40 rounded-2xl p-12 text-center text-muted-foreground">Saxlanmış kart yoxdur</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {cards.map((c) => (
              <div key={c.id} className="bg-gradient-brand text-primary-foreground rounded-2xl p-5 relative shadow-elegant">
                <button onClick={() => remove(c.id)} className="absolute top-3 right-3 p-1.5 bg-background/20 rounded-lg hover:bg-background/30">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="text-xs opacity-80">{c.brand}</div>
                <div className="text-2xl font-bold tracking-widest mt-6">•••• •••• •••• {c.last4}</div>
                <div className="flex justify-between mt-4 text-xs">
                  <div><div className="opacity-70">SAHİB</div><div className="font-semibold">{c.holder || "—"}</div></div>
                  <div><div className="opacity-70">ETİBAR</div><div className="font-semibold">{c.exp}</div></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <h2 className="font-bold mb-2">Digər ödəniş üsulları</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { t: "Kuryerə nağd", d: "Mal alınan zaman ödəniş" },
              { t: "Bank köçürməsi", d: "Hesab nömrəsinə köçürmə" },
              { t: "Hissəli ödəniş", d: "Tezliklə əlavə olunacaq", disabled: true },
              { t: "Apple/Google Pay", d: "Tezliklə əlavə olunacaq", disabled: true },
            ].map((m, i) => (
              <div key={i} className={`bg-card border border-border rounded-xl p-4 ${m.disabled ? "opacity-50" : ""}`}>
                <div className="font-bold">{m.t}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.d}</div>
              </div>
            ))}
          </div>
        </div>

        {adding && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAdding(false)}>
            <div className="bg-card rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">Yeni kart əlavə et</h2>
              <div className="space-y-3">
                <input placeholder="Kart nömrəsi" value={form.number} maxLength={19}
                       onChange={(e) => setForm({ ...form, number: e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim() })}
                       className="w-full h-11 px-3 rounded-lg border border-input bg-background tracking-widest" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="MM/YY" value={form.exp} maxLength={5}
                         onChange={(e) => {
                           let v = e.target.value.replace(/\D/g, "");
                           if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                           setForm({ ...form, exp: v });
                         }}
                         className="h-11 px-3 rounded-lg border border-input bg-background" />
                  <input placeholder="CVV" value={form.cvv} maxLength={4} type="password"
                         onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "") })}
                         className="h-11 px-3 rounded-lg border border-input bg-background" />
                </div>
                <input placeholder="Kart sahibinin adı" value={form.holder}
                       onChange={(e) => setForm({ ...form, holder: e.target.value })}
                       className="w-full h-11 px-3 rounded-lg border border-input bg-background uppercase" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={addCard} className="flex-1 bg-primary text-primary-foreground h-11 rounded-lg font-bold">Əlavə et</button>
                <button onClick={() => setAdding(false)} className="px-4 h-11 rounded-lg border border-border">Ləğv et</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
