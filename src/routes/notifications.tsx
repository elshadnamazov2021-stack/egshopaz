import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PanelLayout } from "@/components/PanelLayout";
import { useBuyerNav } from "@/hooks/useBuyerNav";
import { Bell, Trash2 } from "lucide-react";
import { formatAZN } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Bildirişlər — Elzan Shop" }] }),
  component: NotificationsPage,
});

interface Alert { id: string; product_id: string; target_price: number; products: { title: string; price: number; image_url: string | null } | null }

function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { items } = useBuyerNav();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [user, authLoading, navigate]);

  const load = () => {
    if (!user) return;
    supabase.from("price_alerts").select("*, products(title,price,image_url)").eq("user_id", user.id)
      .then(({ data }) => setAlerts((data ?? []) as unknown as Alert[]));
  };
  useEffect(load, [user]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("price_alerts").delete().eq("id", id);
    if (error) toast.error("Silinmədi"); else { toast.success("Silindi"); load(); }
  };

  if (!user) return null;

  return (
    <PanelLayout title="Müştərinin şəxsi kabineti" subtitle={user.email ?? undefined} items={items}>
      <div>
        <h1 className="text-2xl font-extrabold mb-4 flex items-center gap-2"><Bell className="h-6 w-6 text-primary" /> Bildirişlər</h1>

        <h2 className="font-bold mb-3">Qiymət düşmə bildirişləri</h2>
        {alerts.length === 0 ? (
          <div className="bg-secondary/40 rounded-2xl p-12 text-center text-muted-foreground">
            Qiymət bildirişiniz yoxdur. Məhsul səhifəsində "Qiymət düşəndə xəbər ver" düyməsi ilə əlavə edə bilərsiniz.
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => {
              const reached = a.products && a.products.price <= a.target_price;
              return (
                <div key={a.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                  <Link to="/product/$id" params={{ id: a.product_id }} className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                    {a.products?.image_url && <img src={a.products.image_url} alt="" className="w-full h-full object-cover" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to="/product/$id" params={{ id: a.product_id }} className="font-medium hover:text-primary truncate block">{a.products?.title}</Link>
                    <div className="text-xs text-muted-foreground">
                      Hədəf: {formatAZN(a.target_price)} · Cari: <span className={reached ? "text-green-600 font-bold" : ""}>{formatAZN(a.products?.price ?? 0)}</span>
                    </div>
                  </div>
                  {reached && <span className="text-[10px] bg-green-500 text-white px-2 py-1 rounded-full font-bold">ÇATDI!</span>}
                  <button onClick={() => remove(a.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
