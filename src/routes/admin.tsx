import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatAZN } from "@/lib/format";
import {
  Users, Package, ShoppingBag, DollarSign, Shield, LayoutDashboard,
  Truck, Warehouse, Store, Megaphone, BarChart3, Lock, Scale,
  FileText, Settings, LifeBuoy, AlertTriangle, TrendingUp, Plus, Trash2,
  CheckCircle2, XCircle, Power, Ban, Edit3, Bell, Tag, Crown, Gem, Star, Award,
} from "lucide-react";
import { toast } from "sonner";
import { PanelLayout, type PanelNavItem } from "@/components/PanelLayout";
import { AZ_CITY_NAMES, findCity } from "@/lib/azCities";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin paneli — Elzan Shop" }] }),
  component: AdminPanel,
});

type TabKey =
  | "dashboard" | "customers" | "sellers" | "couriers" | "pvz_staff"
  | "categories" | "products" | "shops" | "warehouses" | "pickup_points"
  | "orders" | "finance" | "marketing" | "banners" | "promo" | "analytics"
  | "security" | "disputes" | "content" | "settings" | "support";

interface Stat { users: number; products: number; orders: number; revenue: number; sellers: number }
interface ProfileRow { id: string; full_name: string | null; shop_name: string | null; created_at: string; phone: string | null }
interface RoleRow { user_id: string; role: string }
interface OrderRow { id: string; total: number; status: string; created_at: string; buyer_id: string }
interface ProductRow { id: string; title: string; price: number; stock: number; is_active: boolean; seller_id: string; image_url: string | null; category_id: string | null }
interface CategoryRow { id: string; name: string; slug: string; icon: string | null; sort_order: number; parent_id: string | null }
interface CourierRow { id: string; full_name: string; phone: string; vehicle_type: string; city: string; is_active: boolean; rating: number; total_deliveries: number; earnings: number }
interface WarehouseRow { id: string; name: string; city: string; address: string; capacity: number; occupied: number; manager_name: string | null; is_active: boolean }
interface PickupRow { id: string; name: string; city: string; address: string; phone: string | null; is_active: boolean; working_hours: string }
interface BannerRow { id: string; title: string; image_url: string | null; link_url: string | null; position: string; is_active: boolean; clicks: number; impressions: number }
interface DisputeRow { id: string; order_id: string | null; buyer_id: string; seller_id: string | null; reason: string; status: string; compensation: number | null; created_at: string }
interface PromoRow { id: string; code: string; discount_percent: number | null; discount_amount: number | null; is_active: boolean; used_count: number; usage_limit: number | null; min_order: number }
interface SettingsRow { id: string; commission_percent: number; delivery_base_fee: number; storage_fee_per_day: number; maintenance_mode: boolean; min_payout: number }
interface TicketRow { id: string; subject: string; category: string; status: string; user_id: string; created_at: string; admin_reply: string | null }

function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [stats, setStats] = useState<Stat>({ users: 0, products: 0, orders: 0, revenue: 0, sellers: 0 });
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [couriers, setCouriers] = useState<CourierRow[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [pickups, setPickups] = useState<PickupRow[]>([]);
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
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
      const { data, error } = await supabase.functions.invoke("verify-admin-password", { body: { password: pwInput } });
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
    const [
      { count: u }, { count: p }, { data: os }, { data: pr }, { data: rs },
      { data: prod }, { data: cats }, { data: cour }, { data: wh },
      { data: pp }, { data: bn }, { data: dsp }, { data: prm }, { data: stg }, { data: tkt },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("profiles").select("id,full_name,shop_name,created_at,phone").order("created_at", { ascending: false }).limit(200),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("products").select("id,title,price,stock,is_active,seller_id,image_url,category_id").order("created_at", { ascending: false }).limit(200),
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("couriers").select("*").order("created_at", { ascending: false }),
      supabase.from("warehouses").select("*").order("created_at", { ascending: false }),
      supabase.from("pickup_points").select("*").order("created_at", { ascending: false }),
      supabase.from("banners").select("*").order("created_at", { ascending: false }),
      supabase.from("disputes").select("*").order("created_at", { ascending: false }),
      supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("system_settings").select("*").limit(1).maybeSingle(),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    const orderRows = (os ?? []) as OrderRow[];
    const roleRows = (rs ?? []) as RoleRow[];
    setOrders(orderRows);
    setProfiles((pr ?? []) as ProfileRow[]);
    setRoles(roleRows);
    setProducts((prod ?? []) as ProductRow[]);
    setCategories((cats ?? []) as CategoryRow[]);
    setCouriers((cour ?? []) as CourierRow[]);
    setWarehouses((wh ?? []) as WarehouseRow[]);
    setPickups((pp ?? []) as PickupRow[]);
    setBanners((bn ?? []) as BannerRow[]);
    setDisputes((dsp ?? []) as DisputeRow[]);
    setPromos((prm ?? []) as PromoRow[]);
    setSettings((stg ?? null) as SettingsRow | null);
    setTickets((tkt ?? []) as TicketRow[]);
    setStats({
      users: u ?? 0, products: p ?? 0, orders: orderRows.length,
      revenue: orderRows.reduce((s, o) => s + Number(o.total), 0),
      sellers: roleRows.filter((r) => r.role === "seller").length,
    });
  };

  useEffect(() => { if (isAdmin && unlocked) reload(); }, [isAdmin, unlocked]);

  if (!user) return null;

  if (!unlocked) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-extrabold">Admin paneli — Parol</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-5">Admin panelinə daxil olmaq üçün təhlükəsizlik parolunu daxil edin.</p>
          <form onSubmit={submitPassword} className="space-y-3">
            <input type="password" autoFocus value={pwInput} onChange={(e) => setPwInput(e.target.value)} placeholder="Parol"
              className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            {pwError && <div className="text-sm text-destructive">{pwError}</div>}
            <button type="submit" disabled={pwSubmitting || !pwInput}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 transition">
              {pwSubmitting ? "Yoxlanılır..." : "Daxil ol"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const userRoles = (uid: string) => roles.filter((r) => r.user_id === uid).map((r) => r.role);
  const isCustomer = (uid: string) => !userRoles(uid).includes("seller") && !userRoles(uid).includes("admin");

  // ── Mutations ────────────────────────────────────────────────
  const updateOrderStatus = async (id: string, status: string) => {
    const typed = status as "pending" | "paid" | "shipped" | "delivered" | "cancelled";
    const { error } = await supabase.from("orders").update({ status: typed }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status yeniləndi"); setOrders(orders.map((o) => o.id === id ? { ...o, status } : o)); }
  };

  const toggleSeller = async (uid: string, makeSeller: boolean) => {
    if (makeSeller) {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "seller" });
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "seller");
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Yeniləndi"); reload();
  };

  const toggleProductActive = async (id: string, active: boolean) => {
    await supabase.from("products").update({ is_active: !active }).eq("id", id); reload();
  };

  const addCategory = async () => {
    const name = prompt("Kateqoriya adı:");
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { error } = await supabase.from("categories").insert({ name, slug, sort_order: categories.length });
    if (error) toast.error(error.message); else { toast.success("Əlavə edildi"); reload(); }
  };
  const deleteCategory = async (id: string) => {
    if (!confirm("Silmək?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Silindi"); reload(); }
  };

  const addCourier = async () => {
    const full_name = prompt("Kuryerin adı:"); if (!full_name) return;
    const phone = prompt("Telefon:") ?? ""; if (!phone) return;
    const { error } = await supabase.from("couriers").insert({ full_name, phone, vehicle_type: "car", city: "Bakı" });
    if (error) toast.error(error.message); else { toast.success("Əlavə edildi"); reload(); }
  };
  const toggleCourier = async (id: string, active: boolean) => {
    await supabase.from("couriers").update({ is_active: !active }).eq("id", id); reload();
  };

  const addWarehouse = async () => {
    const name = prompt("Anbar adı:"); if (!name) return;
    const city = prompt("Şəhər:") ?? "Bakı";
    const address = prompt("Ünvan:") ?? "";
    const { error } = await supabase.from("warehouses").insert({ name, city, address, capacity: 1000 });
    if (error) toast.error(error.message); else { toast.success("Əlavə edildi"); reload(); }
  };

  const addPickup = async () => {
    const name = prompt("PVZ adı:"); if (!name) return;
    const cityList = AZ_CITY_NAMES.join(", ");
    const city = prompt(`Şəhər (mümkün: ${cityList.slice(0, 200)}...):`) ?? "Bakı";
    const address = prompt("Ünvan:") ?? "";
    const c = findCity(city);
    const { error } = await supabase.from("pickup_points").insert({
      name, city, address, lat: c?.lat ?? null, lng: c?.lng ?? null,
    });
    if (error) toast.error(error.message); else { toast.success("Əlavə edildi"); reload(); }
  };
  const togglePickup = async (id: string, active: boolean) => {
    await supabase.from("pickup_points").update({ is_active: !active }).eq("id", id); reload();
  };

  const addBanner = async () => {
    const title = prompt("Banner başlığı:"); if (!title) return;
    const image_url = prompt("Şəkil URL (opsional):") || null;
    const link_url = prompt("Link (opsional):") || null;
    const { error } = await supabase.from("banners").insert({ title, image_url, link_url, position: "home_top" });
    if (error) toast.error(error.message); else { toast.success("Əlavə edildi"); reload(); }
  };
  const toggleBanner = async (id: string, active: boolean) => {
    await supabase.from("banners").update({ is_active: !active }).eq("id", id); reload();
  };
  const deleteBanner = async (id: string) => {
    if (!confirm("Silmək?")) return;
    await supabase.from("banners").delete().eq("id", id); reload();
  };

  const addPromo = async () => {
    const code = prompt("Promokod (məs: WELCOME10):"); if (!code) return;
    const pct = Number(prompt("Endirim %:") ?? "10");
    const { error } = await supabase.from("promo_codes").insert({ code: code.toUpperCase(), discount_percent: pct, min_order: 0 });
    if (error) toast.error(error.message); else { toast.success("Əlavə edildi"); reload(); }
  };
  const togglePromo = async (id: string, active: boolean) => {
    await supabase.from("promo_codes").update({ is_active: !active }).eq("id", id); reload();
  };

  const resolveDispute = async (id: string, decided_for: "buyer" | "seller", compensation = 0) => {
    await supabase.from("disputes").update({ status: "resolved", decided_for, compensation }).eq("id", id);
    toast.success("Mübahisə həll edildi"); reload();
  };

  const updateSettings = async (patch: Partial<SettingsRow>) => {
    if (!settings) return;
    const { error } = await supabase.from("system_settings").update(patch).eq("id", settings.id);
    if (error) toast.error(error.message); else { toast.success("Saxlandı"); reload(); }
  };

  const replyTicket = async (id: string) => {
    const reply = prompt("Cavabınız:"); if (!reply) return;
    await supabase.from("support_tickets").update({ admin_reply: reply, status: "answered" }).eq("id", id);
    toast.success("Cavab göndərildi"); reload();
  };

  // ── Navigation items ─────────────────────────────────────────
  const navItems: PanelNavItem[] = [
    { key: "dashboard", label: "Ana səhifə", icon: LayoutDashboard, active: tab === "dashboard", onClick: () => setTab("dashboard") },
    { key: "customers", label: "Müştərilər", icon: Users, active: tab === "customers", onClick: () => setTab("customers") },
    { key: "sellers", label: "Satıcılar", icon: Store, active: tab === "sellers", onClick: () => setTab("sellers") },
    { key: "couriers", label: "Kuryerlər", icon: Truck, badge: couriers.filter((c) => c.is_active).length, active: tab === "couriers", onClick: () => setTab("couriers") },
    { key: "pvz_staff", label: "PVZ işçiləri", icon: Users, active: tab === "pvz_staff", onClick: () => setTab("pvz_staff") },
    { key: "categories", label: "Kateqoriyalar", icon: LayoutDashboard, active: tab === "categories", onClick: () => setTab("categories") },
    { key: "products", label: "Məhsullar", icon: Package, active: tab === "products", onClick: () => setTab("products") },
    { key: "shops", label: "Mağazalar", icon: Store, active: tab === "shops", onClick: () => setTab("shops") },
    { key: "warehouses", label: "Anbarlar", icon: Warehouse, active: tab === "warehouses", onClick: () => setTab("warehouses") },
    { key: "pickup_points", label: "PVZ nöqtələri", icon: Warehouse, active: tab === "pickup_points", onClick: () => setTab("pickup_points") },
    { key: "orders", label: "Sifarişlər", icon: ShoppingBag, badge: orders.filter((o) => o.status === "pending").length, active: tab === "orders", onClick: () => setTab("orders") },
    { key: "finance", label: "Maliyyə", icon: DollarSign, active: tab === "finance", onClick: () => setTab("finance") },
    { key: "marketing", label: "Marketinq", icon: Megaphone, active: tab === "marketing", onClick: () => setTab("marketing") },
    { key: "banners", label: "Bannerlər", icon: Megaphone, active: tab === "banners", onClick: () => setTab("banners") },
    { key: "promo", label: "Promokodlar", icon: Tag, active: tab === "promo", onClick: () => setTab("promo") },
    { key: "analytics", label: "Analitika", icon: BarChart3, active: tab === "analytics", onClick: () => setTab("analytics") },
    { key: "security", label: "Təhlükəsizlik", icon: Lock, active: tab === "security", onClick: () => setTab("security") },
    { key: "disputes", label: "Mübahisələr", icon: Scale, badge: disputes.filter((d) => d.status === "open").length, active: tab === "disputes", onClick: () => setTab("disputes") },
    { key: "content", label: "Kontent", icon: FileText, active: tab === "content", onClick: () => setTab("content") },
    { key: "settings", label: "Sistem ayarları", icon: Settings, active: tab === "settings", onClick: () => setTab("settings") },
    { key: "support", label: "Dəstək", icon: LifeBuoy, badge: tickets.filter((t) => t.status === "open").length, active: tab === "support", onClick: () => setTab("support") },
  ];

  const tabTitle = navItems.find((n) => n.key === tab)?.label ?? "Admin";

  return (
    <PanelLayout title="Admin paneli" subtitle="Mərkəzi idarəetmə" items={navItems}>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-7 w-7 text-primary" />
        <h1 className="text-2xl md:text-3xl font-extrabold">{tabTitle}</h1>
      </div>

      {tab === "dashboard" && <DashboardSection stats={stats} orders={orders} couriers={couriers} disputes={disputes} />}
      {tab === "customers" && <CustomersSection profiles={profiles.filter((p) => isCustomer(p.id))} />}
      {tab === "sellers" && <SellersSection profiles={profiles} userRoles={userRoles} toggleSeller={toggleSeller} />}
      {tab === "couriers" && <CouriersSection couriers={couriers} addCourier={addCourier} toggleCourier={toggleCourier} />}
      {tab === "pvz_staff" && <PvzStaffSection />}
      {tab === "categories" && <CategoriesSection categories={categories} addCategory={addCategory} deleteCategory={deleteCategory} />}
      {tab === "products" && <ProductsSection products={products} toggleProductActive={toggleProductActive} />}
      {tab === "shops" && <ShopsSection profiles={profiles} userRoles={userRoles} />}
      {tab === "warehouses" && <WarehousesSection warehouses={warehouses} addWarehouse={addWarehouse} />}
      {tab === "pickup_points" && <PickupSection pickups={pickups} addPickup={addPickup} togglePickup={togglePickup} />}
      {tab === "orders" && <OrdersSection orders={orders} updateOrderStatus={updateOrderStatus} />}
      {tab === "finance" && <FinanceSection stats={stats} orders={orders} settings={settings} />}
      {tab === "marketing" && <MarketingSection />}
      {tab === "banners" && <BannersSection banners={banners} addBanner={addBanner} toggleBanner={toggleBanner} deleteBanner={deleteBanner} />}
      {tab === "promo" && <PromoSection promos={promos} addPromo={addPromo} togglePromo={togglePromo} />}
      {tab === "analytics" && <AnalyticsSection products={products} orders={orders} categories={categories} />}
      {tab === "security" && <SecuritySection />}
      {tab === "disputes" && <DisputesSection disputes={disputes} resolveDispute={resolveDispute} />}
      {tab === "content" && <ContentSection />}
      {tab === "settings" && <SettingsSection settings={settings} updateSettings={updateSettings} />}
      {tab === "support" && <SupportSection tickets={tickets} replyTicket={replyTicket} />}
    </PanelLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section components
// ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof Users; label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-extrabold mt-1">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-soft flex items-center justify-center text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-secondary/50 text-left">
          <tr>{headers.map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function EmptyRow({ cols, text = "Məlumat yoxdur" }: { cols: number; text?: string }) {
  return <tr><td colSpan={cols} className="p-6 text-center text-muted-foreground">{text}</td></tr>;
}

function DashboardSection({ stats, orders, couriers, disputes }: { stats: Stat; orders: OrderRow[]; couriers: CourierRow[]; disputes: DisputeRow[] }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayRevenue = orders.filter((o) => new Date(o.created_at) >= today).reduce((s, o) => s + Number(o.total), 0);
  const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthRevenue = orders.filter((o) => new Date(o.created_at) >= monthAgo).reduce((s, o) => s + Number(o.total), 0);
  const openDisputes = disputes.filter((d) => d.status === "open").length;
  const activeCouriers = couriers.filter((c) => c.is_active).length;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Ümumi dövriyyə" value={formatAZN(stats.revenue)} hint={`Bu gün: ${formatAZN(todayRevenue)}`} />
        <StatCard icon={Store} label="Aktiv satıcılar" value={stats.sellers} />
        <StatCard icon={Users} label="Müştərilər" value={stats.users} />
        <StatCard icon={ShoppingBag} label="Sifarişlər" value={stats.orders} hint={`Bu ay: ${formatAZN(monthRevenue)}`} />
        <StatCard icon={Package} label="Məhsullar" value={stats.products} />
        <StatCard icon={Truck} label="Aktiv kuryerlər" value={activeCouriers} />
        <StatCard icon={Scale} label="Açıq mübahisələr" value={openDisputes} />
        <StatCard icon={TrendingUp} label="Real vaxt" value="Online" hint="Sistem normal işləyir" />
      </div>

      {(openDisputes > 0 || stats.users < 1) && (
        <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-bold text-warning">Sistem xəbərdarlıqları</div>
            {openDisputes > 0 && <div>{openDisputes} açıq mübahisə həll gözləyir</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomersSection({ profiles }: { profiles: ProfileRow[] }) {
  return (
    <Table headers={["Ad", "Telefon", "Qoşulma tarixi", "Əməliyyat"]}>
      {profiles.length === 0 ? <EmptyRow cols={4} /> : profiles.map((p) => (
        <tr key={p.id} className="border-t border-border">
          <td className="p-3">{p.full_name ?? "—"}</td>
          <td className="p-3 text-muted-foreground">{p.phone ?? "—"}</td>
          <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("az-AZ")}</td>
          <td className="p-3">
            <button onClick={() => toast.info("Bloklama tezliklə əlavə olunacaq")} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary font-semibold">
              <Ban className="h-3 w-3 inline mr-1" /> Blokla
            </button>
          </td>
        </tr>
      ))}
    </Table>
  );
}

function SellersSection({ profiles, userRoles, toggleSeller }: { profiles: ProfileRow[]; userRoles: (uid: string) => string[]; toggleSeller: (uid: string, makeSeller: boolean) => void }) {
  return (
    <Table headers={["Ad", "Mağaza", "Rollar", "Komissiya", "Əməliyyat"]}>
      {profiles.length === 0 ? <EmptyRow cols={5} /> : profiles.map((p) => {
        const r = userRoles(p.id);
        const isSeller = r.includes("seller");
        return (
          <tr key={p.id} className="border-t border-border">
            <td className="p-3">{p.full_name ?? "—"}</td>
            <td className="p-3 text-muted-foreground">{p.shop_name ?? "—"}</td>
            <td className="p-3">
              <div className="flex gap-1 flex-wrap">
                {r.map((role) => <span key={role} className="text-xs px-2 py-0.5 rounded-full bg-gradient-soft text-primary font-semibold">{role}</span>)}
              </div>
            </td>
            <td className="p-3 text-xs">10%</td>
            <td className="p-3">
              <button onClick={() => toggleSeller(p.id, !isSeller)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary font-semibold">
                {isSeller ? "Satıcılıqdan çıxar" : "Satıcı et"}
              </button>
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

function CouriersSection({ couriers, addCourier, toggleCourier }: { couriers: CourierRow[]; addCourier: () => void; toggleCourier: (id: string, active: boolean) => void }) {
  return (
    <div className="space-y-4">
      <button onClick={addCourier} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center gap-2 hover:bg-primary/90">
        <Plus className="h-4 w-4" /> Yeni kuryer
      </button>
      <Table headers={["Ad", "Telefon", "Şəhər", "Reytinq", "Çatdırılma", "Qazanc", "Status"]}>
        {couriers.length === 0 ? <EmptyRow cols={7} text="Hələ kuryer əlavə edilməyib" /> : couriers.map((c) => (
          <tr key={c.id} className="border-t border-border">
            <td className="p-3 font-semibold">{c.full_name}</td>
            <td className="p-3 text-muted-foreground">{c.phone}</td>
            <td className="p-3">{c.city}</td>
            <td className="p-3">⭐ {c.rating}</td>
            <td className="p-3">{c.total_deliveries}</td>
            <td className="p-3">{formatAZN(c.earnings)}</td>
            <td className="p-3">
              <button onClick={() => toggleCourier(c.id, c.is_active)} className={`text-xs px-2 py-1 rounded-full font-semibold ${c.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {c.is_active ? "Aktiv" : "Deaktiv"}
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function PvzStaffSection() {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
      <div className="font-bold mb-1">PVZ işçiləri</div>
      <div className="text-sm text-muted-foreground">Hər PVZ nöqtəsinə işçi təyin etmək üçün "PVZ nöqtələri" bölməsindən nöqtəyə daxil olun.</div>
    </div>
  );
}

function CategoriesSection({ categories, addCategory, deleteCategory }: { categories: CategoryRow[]; addCategory: () => void; deleteCategory: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <button onClick={addCategory} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center gap-2 hover:bg-primary/90">
        <Plus className="h-4 w-4" /> Yeni kateqoriya
      </button>
      <Table headers={["Ikon", "Ad", "Slug", "Sıra", "Əməliyyat"]}>
        {categories.length === 0 ? <EmptyRow cols={5} /> : categories.map((c) => (
          <tr key={c.id} className="border-t border-border">
            <td className="p-3 text-2xl">{c.icon ?? "📁"}</td>
            <td className="p-3 font-semibold">{c.name}</td>
            <td className="p-3 text-xs text-muted-foreground font-mono">{c.slug}</td>
            <td className="p-3">{c.sort_order}</td>
            <td className="p-3">
              <button onClick={() => deleteCategory(c.id)} className="text-xs px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 font-semibold inline-flex items-center gap-1">
                <Trash2 className="h-3 w-3" /> Sil
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function ProductsSection({ products, toggleProductActive }: { products: ProductRow[]; toggleProductActive: (id: string, active: boolean) => void }) {
  return (
    <Table headers={["Məhsul", "Qiymət", "Stok", "Status"]}>
      {products.length === 0 ? <EmptyRow cols={4} /> : products.map((p) => (
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
            <button onClick={() => toggleProductActive(p.id, p.is_active)} className={`text-xs px-2 py-1 rounded-full font-semibold ${p.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
              {p.is_active ? "Aktiv" : "Deaktiv"}
            </button>
          </td>
        </tr>
      ))}
    </Table>
  );
}

function ShopsSection({ profiles, userRoles }: { profiles: ProfileRow[]; userRoles: (uid: string) => string[] }) {
  const shops = profiles.filter((p) => userRoles(p.id).includes("seller") && p.shop_name);
  return (
    <Table headers={["Mağaza", "Sahib", "Reytinq", "Şikayət", "Əməliyyat"]}>
      {shops.length === 0 ? <EmptyRow cols={5} /> : shops.map((s) => (
        <tr key={s.id} className="border-t border-border">
          <td className="p-3 font-semibold">{s.shop_name}</td>
          <td className="p-3 text-muted-foreground">{s.full_name ?? "—"}</td>
          <td className="p-3">⭐ 4.8</td>
          <td className="p-3">0</td>
          <td className="p-3">
            <button onClick={() => toast.info("Tezliklə əlavə olunacaq")} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary font-semibold">
              <Power className="h-3 w-3 inline mr-1" /> Dayandır
            </button>
          </td>
        </tr>
      ))}
    </Table>
  );
}

function WarehousesSection({ warehouses, addWarehouse }: { warehouses: WarehouseRow[]; addWarehouse: () => void }) {
  return (
    <div className="space-y-4">
      <button onClick={addWarehouse} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center gap-2 hover:bg-primary/90">
        <Plus className="h-4 w-4" /> Yeni anbar
      </button>
      <Table headers={["Ad", "Şəhər", "Ünvan", "Tutum", "Doluluk"]}>
        {warehouses.length === 0 ? <EmptyRow cols={5} text="Hələ anbar əlavə edilməyib" /> : warehouses.map((w) => {
          const pct = w.capacity > 0 ? Math.round((w.occupied / w.capacity) * 100) : 0;
          return (
            <tr key={w.id} className="border-t border-border">
              <td className="p-3 font-semibold">{w.name}</td>
              <td className="p-3">{w.city}</td>
              <td className="p-3 text-muted-foreground text-xs">{w.address}</td>
              <td className="p-3">{w.capacity}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden min-w-[80px]">
                    <div className={`h-full ${pct > 80 ? "bg-destructive" : pct > 50 ? "bg-warning" : "bg-success"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold">{pct}%</span>
                </div>
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}

function PickupSection({ pickups, addPickup, togglePickup }: { pickups: PickupRow[]; addPickup: () => void; togglePickup: (id: string, active: boolean) => void }) {
  return (
    <div className="space-y-4">
      <button onClick={addPickup} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center gap-2 hover:bg-primary/90">
        <Plus className="h-4 w-4" /> Yeni PVZ
      </button>
      <Table headers={["Ad", "Şəhər", "Ünvan", "İş saatları", "Telefon", "Status"]}>
        {pickups.length === 0 ? <EmptyRow cols={6} /> : pickups.map((p) => (
          <tr key={p.id} className="border-t border-border">
            <td className="p-3 font-semibold">{p.name}</td>
            <td className="p-3">{p.city}</td>
            <td className="p-3 text-muted-foreground text-xs">{p.address}</td>
            <td className="p-3 text-xs">{p.working_hours}</td>
            <td className="p-3 text-muted-foreground">{p.phone ?? "—"}</td>
            <td className="p-3">
              <button onClick={() => togglePickup(p.id, p.is_active)} className={`text-xs px-2 py-1 rounded-full font-semibold ${p.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {p.is_active ? "Aktiv" : "Deaktiv"}
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function OrdersSection({ orders, updateOrderStatus }: { orders: OrderRow[]; updateOrderStatus: (id: string, status: string) => void }) {
  return (
    <Table headers={["№", "Tarix", "Məbləğ", "Status"]}>
      {orders.length === 0 ? <EmptyRow cols={4} /> : orders.map((o) => (
        <tr key={o.id} className="border-t border-border">
          <td className="p-3 font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</td>
          <td className="p-3">{new Date(o.created_at).toLocaleDateString("az-AZ")}</td>
          <td className="p-3 font-semibold">{formatAZN(o.total)}</td>
          <td className="p-3">
            <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="text-xs px-2 py-1 rounded border border-input bg-background">
              <option value="pending">Gözləyir</option>
              <option value="paid">Ödənildi</option>
              <option value="shipped">Göndərildi</option>
              <option value="delivered">Çatdırıldı</option>
              <option value="cancelled">Ləğv edildi</option>
            </select>
          </td>
        </tr>
      ))}
    </Table>
  );
}

function FinanceSection({ stats, orders, settings }: { stats: Stat; orders: OrderRow[]; settings: SettingsRow | null }) {
  const commission = settings?.commission_percent ?? 10;
  const platformIncome = stats.revenue * (commission / 100);
  const sellerPayout = stats.revenue - platformIncome;
  const paidOrders = orders.filter((o) => o.status === "paid" || o.status === "delivered").length;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={DollarSign} label="Ümumi gəlir" value={formatAZN(stats.revenue)} />
        <StatCard icon={TrendingUp} label="Platform komissiyası" value={formatAZN(platformIncome)} hint={`${commission}%`} />
        <StatCard icon={Store} label="Satıcılara ödəniş" value={formatAZN(sellerPayout)} />
        <StatCard icon={ShoppingBag} label="Ödənilmiş sifarişlər" value={paidOrders} />
        <StatCard icon={AlertTriangle} label="Geri qaytarmalar" value="0" hint="Mock" />
        <StatCard icon={Lock} label="Fırıldaq aşkarı" value="0" hint="Sistem təmiz" />
      </div>
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="font-bold mb-3">Vergi hesabatı (cari ay)</div>
        <div className="text-sm text-muted-foreground">ƏDV (18%): <span className="font-semibold text-foreground">{formatAZN(stats.revenue * 0.18)}</span></div>
        <div className="text-sm text-muted-foreground">Mənfəət vergisi: <span className="font-semibold text-foreground">{formatAZN(platformIncome * 0.2)}</span></div>
      </div>
    </div>
  );
}

function MarketingSection() {
  const channels = [
    { name: "Push bildirişlər", icon: Bell, sent: 0, opened: 0 },
    { name: "Email kampaniyalar", icon: FileText, sent: 0, opened: 0 },
    { name: "SMS kampaniyalar", icon: Megaphone, sent: 0, opened: 0 },
  ];
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        {channels.map((c) => (
          <div key={c.name} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <c.icon className="h-5 w-5 text-primary" />
              <button className="text-xs px-3 py-1 rounded-lg bg-primary text-primary-foreground font-bold" onClick={() => toast.info("Tezliklə")}>Göndər</button>
            </div>
            <div className="font-bold">{c.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.sent} göndərilib · {c.opened} açılıb</div>
          </div>
        ))}
      </div>
      <div className="bg-muted/30 border border-border rounded-2xl p-4 text-sm text-muted-foreground">
        Bu bölmə hələ tam funksional deyil. Real göndəriş üçün email/SMS provayder inteqrasiyası lazımdır.
      </div>
    </div>
  );
}

function BannersSection({ banners, addBanner, toggleBanner, deleteBanner }: { banners: BannerRow[]; addBanner: () => void; toggleBanner: (id: string, active: boolean) => void; deleteBanner: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <button onClick={addBanner} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center gap-2 hover:bg-primary/90">
        <Plus className="h-4 w-4" /> Yeni banner
      </button>
      <Table headers={["Şəkil", "Başlıq", "Pozisiya", "Baxış", "Klik", "CTR", "Status", ""]}>
        {banners.length === 0 ? <EmptyRow cols={8} /> : banners.map((b) => {
          const ctr = b.impressions > 0 ? ((b.clicks / b.impressions) * 100).toFixed(1) : "0.0";
          return (
            <tr key={b.id} className="border-t border-border">
              <td className="p-3">
                <div className="w-12 h-12 bg-secondary rounded overflow-hidden">
                  {b.image_url && <img src={b.image_url} alt="" className="w-full h-full object-cover" />}
                </div>
              </td>
              <td className="p-3 font-semibold">{b.title}</td>
              <td className="p-3 text-xs">{b.position}</td>
              <td className="p-3">{b.impressions}</td>
              <td className="p-3">{b.clicks}</td>
              <td className="p-3">{ctr}%</td>
              <td className="p-3">
                <button onClick={() => toggleBanner(b.id, b.is_active)} className={`text-xs px-2 py-1 rounded-full font-semibold ${b.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {b.is_active ? "Aktiv" : "Deaktiv"}
                </button>
              </td>
              <td className="p-3">
                <button onClick={() => deleteBanner(b.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}

function PromoSection({ promos, addPromo, togglePromo }: { promos: PromoRow[]; addPromo: () => void; togglePromo: (id: string, active: boolean) => void }) {
  return (
    <div className="space-y-4">
      <button onClick={addPromo} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center gap-2 hover:bg-primary/90">
        <Plus className="h-4 w-4" /> Yeni promokod
      </button>
      <Table headers={["Kod", "Endirim", "İstifadə", "Min sifariş", "Status"]}>
        {promos.length === 0 ? <EmptyRow cols={5} /> : promos.map((p) => (
          <tr key={p.id} className="border-t border-border">
            <td className="p-3 font-mono font-bold">{p.code}</td>
            <td className="p-3">{p.discount_percent ? `${p.discount_percent}%` : formatAZN(p.discount_amount ?? 0)}</td>
            <td className="p-3">{p.used_count} / {p.usage_limit ?? "∞"}</td>
            <td className="p-3">{formatAZN(p.min_order)}</td>
            <td className="p-3">
              <button onClick={() => togglePromo(p.id, p.is_active)} className={`text-xs px-2 py-1 rounded-full font-semibold ${p.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {p.is_active ? "Aktiv" : "Deaktiv"}
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function AnalyticsSection({ products, orders, categories }: { products: ProductRow[]; orders: OrderRow[]; categories: CategoryRow[] }) {
  const topProducts = [...products].sort((a, b) => b.price - a.price).slice(0, 5);
  const totalSales = orders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Cəmi satış" value={formatAZN(totalSales)} />
        <StatCard icon={Package} label="Aktiv kateqoriya" value={categories.filter((c) => !c.parent_id).length} />
        <StatCard icon={Users} label="Qaytarma faizi" value="2.3%" hint="Mock" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="font-bold mb-3">Ən bahalı 5 məhsul</div>
        <div className="space-y-2">
          {topProducts.length === 0 ? <div className="text-sm text-muted-foreground">Məlumat yoxdur</div> : topProducts.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gradient-soft text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="line-clamp-1">{p.title}</span>
              </div>
              <span className="font-semibold">{formatAZN(p.price)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="font-bold mb-3">Ən aktiv bölgələr (Mock)</div>
        {["Bakı", "Sumqayıt", "Gəncə", "Lənkəran"].map((city, i) => {
          const pct = [65, 18, 10, 7][i];
          return (
            <div key={city} className="mb-2">
              <div className="flex justify-between text-sm mb-1"><span>{city}</span><span className="font-semibold">{pct}%</span></div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SecuritySection() {
  const items = [
    { icon: AlertTriangle, label: "Şübhəli hesab fəaliyyəti", value: 0, color: "text-warning" },
    { icon: XCircle, label: "Bloklanmış IP-lər", value: 0, color: "text-destructive" },
    { icon: CheckCircle2, label: "2FA aktiv hesablar", value: 0, color: "text-success" },
    { icon: Lock, label: "Aşkarlanan fırıldaqçılıq", value: 0, color: "text-destructive" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <div key={it.label} className="bg-card border border-border rounded-2xl p-5">
            <it.icon className={`h-6 w-6 ${it.color} mb-3`} />
            <div className="text-sm text-muted-foreground">{it.label}</div>
            <div className="text-2xl font-extrabold mt-1">{it.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="font-bold mb-3">Tövsiyə olunan əməliyyatlar</div>
        <ul className="text-sm space-y-2 text-muted-foreground">
          <li>✓ Bütün admin hesabları üçün 2FA aktivləşdirin</li>
          <li>✓ Şübhəli IP-ləri avtomatik bloklayın</li>
          <li>✓ Bot fəaliyyətinə görə CAPTCHA tətbiq edin</li>
          <li>✓ Saxta rəyləri AI ilə filtrləyin</li>
        </ul>
      </div>
    </div>
  );
}

function DisputesSection({ disputes, resolveDispute }: { disputes: DisputeRow[]; resolveDispute: (id: string, decided_for: "buyer" | "seller", compensation?: number) => void }) {
  return (
    <Table headers={["Tarix", "Sifariş", "Səbəb", "Status", "Kompensasiya", "Qərar"]}>
      {disputes.length === 0 ? <EmptyRow cols={6} text="Mübahisə yoxdur" /> : disputes.map((d) => (
        <tr key={d.id} className="border-t border-border">
          <td className="p-3 text-xs">{new Date(d.created_at).toLocaleDateString("az-AZ")}</td>
          <td className="p-3 font-mono text-xs">{d.order_id?.slice(0, 8).toUpperCase() ?? "—"}</td>
          <td className="p-3">{d.reason}</td>
          <td className="p-3">
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${d.status === "open" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>{d.status}</span>
          </td>
          <td className="p-3">{d.compensation ? formatAZN(d.compensation) : "—"}</td>
          <td className="p-3">
            {d.status === "open" ? (
              <div className="flex gap-2">
                <button onClick={() => resolveDispute(d.id, "buyer")} className="text-xs px-2 py-1 rounded bg-success/10 text-success font-semibold">Alıcı lehinə</button>
                <button onClick={() => resolveDispute(d.id, "seller")} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-semibold">Satıcı lehinə</button>
              </div>
            ) : <span className="text-xs text-muted-foreground">{d.status}</span>}
          </td>
        </tr>
      ))}
    </Table>
  );
}

function ContentSection() {
  const items = [
    { label: "Ana səhifə bannerleri", action: "Bannerlər bölməsindən idarə edin" },
    { label: "Qaydalar və şərtlər", action: "Tezliklə əlavə olunacaq" },
    { label: "FAQ - Tez verilən suallar", action: "Tezliklə əlavə olunacaq" },
    { label: "Xəbərlər və elanlar", action: "Tezliklə əlavə olunacaq" },
  ];
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.label} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">{it.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{it.action}</div>
          </div>
          <button onClick={() => toast.info(it.action)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary font-semibold inline-flex items-center gap-1">
            <Edit3 className="h-3 w-3" /> Redaktə
          </button>
        </div>
      ))}
    </div>
  );
}

function SettingsSection({ settings, updateSettings }: { settings: SettingsRow | null; updateSettings: (patch: Partial<SettingsRow>) => void }) {
  if (!settings) return <div className="text-muted-foreground">Yüklənir...</div>;
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div>
          <label className="text-sm font-semibold">Komissiya faizi (%)</label>
          <input type="number" defaultValue={settings.commission_percent} onBlur={(e) => updateSettings({ commission_percent: Number(e.target.value) })}
            className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-background" />
        </div>
        <div>
          <label className="text-sm font-semibold">Çatdırılma əsas tarifi (AZN)</label>
          <input type="number" step="0.1" defaultValue={settings.delivery_base_fee} onBlur={(e) => updateSettings({ delivery_base_fee: Number(e.target.value) })}
            className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-background" />
        </div>
        <div>
          <label className="text-sm font-semibold">Saxlama haqqı / gün (AZN)</label>
          <input type="number" step="0.1" defaultValue={settings.storage_fee_per_day} onBlur={(e) => updateSettings({ storage_fee_per_day: Number(e.target.value) })}
            className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-background" />
        </div>
        <div>
          <label className="text-sm font-semibold">Min ödəniş (satıcı üçün, AZN)</label>
          <input type="number" defaultValue={settings.min_payout} onBlur={(e) => updateSettings({ min_payout: Number(e.target.value) })}
            className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-background" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <div className="font-semibold">Texniki xidmət rejimi</div>
            <div className="text-xs text-muted-foreground">Aktiv olduqda saytın əksər funksiyaları dayandırılır</div>
          </div>
          <button onClick={() => updateSettings({ maintenance_mode: !settings.maintenance_mode })}
            className={`px-4 py-2 rounded-lg font-bold text-sm ${settings.maintenance_mode ? "bg-destructive text-destructive-foreground" : "bg-secondary"}`}>
            {settings.maintenance_mode ? "Aktiv" : "Deaktiv"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SupportSection({ tickets, replyTicket }: { tickets: TicketRow[]; replyTicket: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={LifeBuoy} label="Açıq müraciətlər" value={tickets.filter((t) => t.status === "open").length} />
        <StatCard icon={CheckCircle2} label="Cavablandırılmış" value={tickets.filter((t) => t.status === "answered").length} />
        <StatCard icon={Users} label="Cəmi" value={tickets.length} />
      </div>
      <Table headers={["Mövzu", "Kateqoriya", "Tarix", "Status", "Əməliyyat"]}>
        {tickets.length === 0 ? <EmptyRow cols={5} /> : tickets.map((t) => (
          <tr key={t.id} className="border-t border-border">
            <td className="p-3 font-semibold">{t.subject}</td>
            <td className="p-3 text-xs">{t.category}</td>
            <td className="p-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("az-AZ")}</td>
            <td className="p-3">
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${t.status === "open" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>{t.status}</span>
            </td>
            <td className="p-3">
              <button onClick={() => replyTicket(t.id)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary font-semibold">Cavab ver</button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
