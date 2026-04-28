import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatAZN } from "@/lib/format";
import { Users, Package, ShoppingBag, DollarSign, Shield, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { PanelLayout, type PanelNavItem } from "@/components/PanelLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin paneli — Elzan Shop" }] }),
  component: AdminPanel,
});

interface Stat { users: number; products: number; orders: number; revenue: number }
interface ProfileRow { id: string; full_name: string | null; shop_name: string | null; created_at: string }
interface RoleRow { user_id: string; role: string }
interface OrderRow { id: string; total: number; status: string; created_at: string; buyer_id: string }
interface ProductRow { id: string; title: string; price: number; stock: number; is_active: boolean; seller_id: string; image_url: string | null }

function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"dashboard" | "orders" | "users" | "products">("dashboard");
  const [stats, setStats] = useState<Stat>({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("admin_panel_unlocked") === "1";
  });
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-admin-password", {
        body: { password: pwInput },
      });
      if (error || !data?.ok) {
        setPwError(data?.error || "Parol yanlışdır");
        setPwSubmitting(false);
        return;
      }
      sessionStorage.setItem("admin_panel_unlocked", "1");
      setUnlocked(true);
      setPwInput("");
    } catch (err) {
      setPwError((err as Error).message);
    } finally {
      setPwSubmitting(false);
    }
  };

  const reload = async () => {
    const [{ count: u }, { count: p }, { data: os }, { data: pr }, { data: rs }, { data: prod }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,full_name,shop_name,created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("products").select("id,title,price,stock,is_active,seller_id,image_url").order("created_at", { ascending: false }).limit(100),
    ]);
    const orderRows = (os ?? []) as OrderRow[];
    setOrders(orderRows);
    setProfiles((pr ?? []) as ProfileRow[]);
    setRoles((rs ?? []) as RoleRow[]);
    setProducts((prod ?? []) as ProductRow[]);
    setStats({
      users: u ?? 0, products: p ?? 0, orders: orderRows.length,
      revenue: orderRows.reduce((s, o) => s + Number(o.total), 0),
    });
  };

  useEffect(() => { if (isAdmin && unlocked) reload(); }, [isAdmin, unlocked]);

  if (!user || !isAdmin) return null;

  if (!unlocked) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-extrabold">Admin paneli — Parol</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Admin panelinə daxil olmaq üçün təhlükəsizlik parolunu daxil edin.
          </p>
          <form onSubmit={submitPassword} className="space-y-3">
            <input
              type="password"
              autoFocus
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              placeholder="Parol"
              className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {pwError && <div className="text-sm text-destructive">{pwError}</div>}
            <button
              type="submit"
              disabled={pwSubmitting || !pwInput}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 transition"
            >
              {pwSubmitting ? "Yoxlanılır..." : "Daxil ol"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const userRoles = (uid: string) => roles.filter((r) => r.user_id === uid).map((r) => r.role);

  const updateOrderStatus = async (id: string, status: string) => {
    const typed = status as "pending" | "paid" | "shipped" | "delivered" | "cancelled";
    const { error } = await supabase.from("orders").update({ status: typed }).eq("id", id);
    if (error) toast.error(error.message); else {
      toast.success("Status yeniləndi");
      setOrders(orders.map((o) => o.id === id ? { ...o, status } : o));
    }
  };

  const toggleSeller = async (uid: string, makeSeller: boolean) => {
    if (makeSeller) {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "seller" });
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "seller");
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Yeniləndi");
    reload();
  };

  const toggleProductActive = async (id: string, active: boolean) => {
    await supabase.from("products").update({ is_active: !active }).eq("id", id);
    reload();
  };

  const navItems: PanelNavItem[] = [
    { key: "dashboard", label: "Ümumi", icon: LayoutDashboard, active: tab === "dashboard", onClick: () => setTab("dashboard") },
    { key: "orders", label: "Sifarişlər", icon: ShoppingBag, badge: orders.filter((o) => o.status === "pending").length, active: tab === "orders", onClick: () => setTab("orders") },
    { key: "users", label: "İstifadəçilər", icon: Users, badge: profiles.length, active: tab === "users", onClick: () => setTab("users") },
    { key: "products", label: "Məhsullar", icon: Package, active: tab === "products", onClick: () => setTab("products") },
  ];

  return (
    <PanelLayout title="Admin paneli" subtitle="Bütün sistem nəzarəti" items={navItems}>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-7 w-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-extrabold capitalize">{tab === "dashboard" ? "Ümumi" : navItems.find((n) => n.key === tab)?.label}</h1>
      </div>

      {tab === "dashboard" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      )}

      {tab === "orders" && (
        <div className="bg-card border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-secondary/50 text-left">
              <tr><th className="p-3">№</th><th className="p-3">Tarix</th><th className="p-3">Məbləğ</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
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
      )}

      {tab === "users" && (
        <div className="bg-card border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-secondary/50 text-left">
              <tr><th className="p-3">Ad</th><th className="p-3">Mağaza</th><th className="p-3">Rollar</th><th className="p-3">Tarix</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const r = userRoles(p.id);
                const isSeller = r.includes("seller");
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3">{p.full_name ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{p.shop_name ?? "—"}</td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {r.map((role) => (
                          <span key={role} className="text-xs px-2 py-0.5 rounded-full bg-gradient-soft text-primary font-semibold">{role}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("az-AZ")}</td>
                    <td className="p-3">
                      <button onClick={() => toggleSeller(p.id, !isSeller)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary font-semibold">
                        {isSeller ? "Satıcılıqdan çıxar" : "Satıcı et"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "products" && (
        <div className="bg-card border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-secondary/50 text-left">
              <tr><th className="p-3">Məhsul</th><th className="p-3">Qiymət</th><th className="p-3">Stok</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded overflow-hidden shrink-0">
                        {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="line-clamp-1">{p.title}</span>
                    </div>
                  </td>
                  <td className="p-3 font-semibold whitespace-nowrap">{formatAZN(p.price)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <button onClick={() => toggleProductActive(p.id, p.is_active)}
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${p.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {p.is_active ? "Aktiv" : "Deaktiv"}
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Məhsul yoxdur</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </PanelLayout>
  );
}
