import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PanelLayout } from "@/components/PanelLayout";
import { useBuyerNav } from "@/hooks/useBuyerNav";
import { formatAZN } from "@/lib/format";
import { Package, MapPin, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Sifarişlərim — One Board Market" }] }),
  component: OrdersPage,
});

interface OrderItem { id: string; title: string; price: number; quantity: number; image_url: string | null; status: string }
interface Order { id: string; total: number; status: string; created_at: string; shipping_address: string | null; payment_method: string; order_items: OrderItem[] }

const statusLabel: Record<string, string> = {
  pending: "Gözləyir", paid: "Ödənildi", shipped: "Göndərildi",
  delivered: "Çatdırıldı", cancelled: "Ləğv edildi",
};
const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { items } = useBuyerNav();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [user, authLoading, navigate]);

  const load = () => {
    if (!user) return;
    supabase.from("orders")
      .select("*, order_items(id,title,price,quantity,image_url,status)")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as Order[]));
  };
  useEffect(load, [user]);

  const cancel = async (id: string) => {
    if (!confirm("Sifarişi ləğv etmək istəyirsiniz?")) return;
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error("Ləğv edilmədi"); else { toast.success("Ləğv edildi"); load(); }
  };

  if (!user) return null;
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <PanelLayout title="Müştərinin şəxsi kabineti" subtitle={user.email ?? undefined} items={items}>
      <div>
        <h1 className="text-2xl font-extrabold mb-4 flex items-center gap-2"><Package className="h-6 w-6 text-primary" /> Sifarişlərim</h1>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {[["all", "Hamısı"], ["pending", "Gözləyir"], ["paid", "Ödənildi"], ["shipped", "Göndərildi"], ["delivered", "Çatdırıldı"], ["cancelled", "Ləğv"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border ${filter === k ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}>
              {l}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="bg-secondary/40 rounded-2xl p-12 text-center text-muted-foreground">Sifariş yoxdur</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <div key={o.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground">№ {o.id.slice(0, 8).toUpperCase()} · {new Date(o.created_at).toLocaleDateString("az-AZ")}</div>
                    {o.shipping_address && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {o.shipping_address}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColor[o.status] ?? "bg-secondary"}`}>{statusLabel[o.status] ?? o.status}</span>
                    <span className="font-extrabold">{formatAZN(o.total)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {o.order_items?.map((it) => (
                    <div key={it.id} className="flex items-center gap-3 text-sm">
                      <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                        {it.image_url && <img src={it.image_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0"><div className="truncate">{it.title}</div><div className="text-xs text-muted-foreground">{it.quantity} × {formatAZN(it.price)}</div></div>
                    </div>
                  ))}
                </div>
                {(o.status === "pending" || o.status === "paid") && (
                  <button onClick={() => cancel(o.id)} className="mt-3 text-sm text-destructive hover:underline inline-flex items-center gap-1">
                    <X className="h-3 w-3" /> Sifarişi ləğv et
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
