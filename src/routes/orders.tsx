import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PanelLayout } from "@/components/PanelLayout";
import { useBuyerNav } from "@/hooks/useBuyerNav";
import { formatAZN } from "@/lib/format";
import { Package, MapPin, X, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Sifarişlərim — Elzan Shop" }] }),
  component: OrdersPage,
});

interface OrderItem { id: string; title: string; price: number; quantity: number; image_url: string | null; status: string; seller_id: string; product_id: string }
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
  const [msgItem, setMsgItem] = useState<OrderItem | null>(null);
  const [msgOrderId, setMsgOrderId] = useState<string | null>(null);
  const [msgBody, setMsgBody] = useState("");
  const [msgSending, setMsgSending] = useState(false);

  const sendMessage = async () => {
    if (!user || !msgItem) return;
    const body = msgBody.trim();
    if (body.length < 2) { toast.error("Mesaj çox qısadır"); return; }
    if (user.id === msgItem.seller_id) { toast.error("Öz mağazanıza mesaj göndərə bilməzsiniz"); return; }
    setMsgSending(true);
    const { error } = await supabase.from("shop_messages").insert({
      buyer_id: user.id,
      seller_id: msgItem.seller_id,
      product_id: msgItem.product_id,
      order_id: msgOrderId,
      sender_role: "buyer",
      body,
    });
    setMsgSending(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Mesaj satıcıya göndərildi");
    setMsgBody(""); setMsgItem(null); setMsgOrderId(null);
  };

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [user, authLoading, navigate]);

  const load = () => {
    if (!user) return;
    supabase.from("orders")
      .select("*, order_items(id,title,price,quantity,image_url,status,seller_id,product_id)")
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
                    <div key={it.id} className="flex items-start gap-3 text-sm">
                      <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                        {it.image_url && <img src={it.image_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{it.title}</div>
                        <div className="text-xs text-muted-foreground">{it.quantity} × {formatAZN(it.price)}</div>
                      </div>
                      {user.id !== it.seller_id && (
                        <button
                          onClick={() => { setMsgItem(it); setMsgOrderId(o.id); setMsgBody(""); }}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-border hover:border-primary hover:text-primary transition inline-flex items-center gap-1 shrink-0"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> Satıcıya yaz
                        </button>
                      )}
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

      {msgItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setMsgItem(null)}>
          <div className="bg-card rounded-2xl p-5 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" /> Satıcıya mesaj</h3>
              <button onClick={() => setMsgItem(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2">{msgItem.title}</div>
            <textarea
              value={msgBody}
              onChange={(e) => setMsgBody(e.target.value)}
              placeholder="Mesajınızı yazın..."
              rows={4}
              maxLength={2000}
              className="w-full p-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setMsgItem(null)} className="text-sm px-3 py-1.5 rounded-lg hover:bg-secondary">Ləğv</button>
              <button
                onClick={sendMessage}
                disabled={msgSending || msgBody.trim().length < 2}
                className="text-sm px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" /> {msgSending ? "..." : "Göndər"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PanelLayout>
  );
}
