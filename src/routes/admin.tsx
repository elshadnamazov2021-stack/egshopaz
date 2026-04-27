import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatAZN } from "@/lib/format";
import { Users, Package, ShoppingBag, DollarSign, Shield } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin paneli — WB market" }] }),
  component: AdminPanel,
});

interface Stat { users: number; products: number; orders: number; revenue: number }
interface ProfileRow { id: string; full_name: string | null; shop_name: string | null; created_at: string }
interface RoleRow { user_id: string; role: string }
interface OrderRow { id: string; total: number; status: string; created_at: string; buyer_id: string }

function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stat>({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && !isAdmin) {
      toast.error("Sizdə admin icazəsi yoxdur");
      navigate({ to: "/" });
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [{ count: u }, { count: p }, { data: os }, { data: pr }, { data: rs }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id,full_name,shop_name,created_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      const orderRows = (os ?? []) as OrderRow[];
      setOrders(orderRows);
      setProfiles((pr ?? []) as ProfileRow[]);
      setRoles((rs ?? []) as RoleRow[]);
      setStats({
        users: u ?? 0, products: p ?? 0, orders: orderRows.length,
        revenue: orderRows.reduce((s, o) => s + Number(o.total), 0),
      });
    })();
  }, [isAdmin]);

  if (!user || !isAdmin) return null;

  const userRoles = (uid: string) => roles.filter((r) => r.user_id === uid).map((r) => r.role);

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else {
      toast.success("Status yeniləndi");
      setOrders(orders.map((o) => o.id === id ? { ...o, status } : o));
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-7 w-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-extrabold">Admin paneli</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: "İstifadəçilər", value: stats.users },
          { icon: Package, label: "Məhsullar", value: stats.products },
          { icon: ShoppingBag, label: "Sifarişlər", value: stats.orders },
          { icon: DollarSign, label: "Ümumi dövriyyə", value: formatAZN(stats.revenue) },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="text-2xl font-extrabold mt-1">{s.value}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-soft flex items-center justify-center text-primary">
                <s.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Son sifarişlər</h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr><th className="p-3">№</th><th className="p-3">Tarix</th><th className="p-3">Məbləğ</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 20).map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-3">{new Date(o.created_at).toLocaleDateString("az-AZ")}</td>
                  <td className="p-3 font-semibold">{formatAZN(o.total)}</td>
                  <td className="p-3">
                    <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="text-xs px-2 py-1 rounded border border-input bg-background">
                      <option value="pending">Gözləyir</option>
                      <option value="paid">Ödənildi</option>
                      <option value="shipped">Göndərildi</option>
                      <option value="delivered">Çatdırıldı</option>
                      <option value="cancelled">Ləğv edildi</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Sifariş yoxdur</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">İstifadəçilər</h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr><th className="p-3">Ad</th><th className="p-3">Mağaza</th><th className="p-3">Rollar</th><th className="p-3">Qeydiyyat</th></tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">{p.full_name ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{p.shop_name ?? "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {userRoles(p.id).map((r) => (
                        <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-gradient-soft text-primary font-semibold">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("az-AZ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
