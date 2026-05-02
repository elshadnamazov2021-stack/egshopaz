import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatAZN } from "@/lib/format";
import {
  Package, User as UserIcon, LogOut, MapPin, Heart, ShoppingCart,
  MessageCircle, Bell, Tag, Clock, Store, Star, ChevronRight,
  Settings, Shield, Globe, HelpCircle, CreditCard, Gift, Pencil
} from "lucide-react";
import { toast } from "sonner";
import { PanelLayout } from "@/components/PanelLayout";
import { useBuyerNav } from "@/hooks/useBuyerNav";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Şəxsi kabinet — Elzan Shop" }] }),
  component: Profile,
});

interface Order {
  id: string; total: number; status: string; created_at: string; shipping_address: string | null;
}

function Profile() {
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [unreadMsg, setUnreadMsg] = useState(0);
  const { items } = useBuyerNav();

  useEffect(() => {
    if (!authLoading && !user) { navigate({ to: "/auth" }); return; }
    if (!user) return;
    // Redirect staff/seller away from the buyer profile page to their own panel
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      const roles = (data ?? []).map((r) => r.role as string);
      if (roles.includes("pvz")) {
        toast.info("PVZ PUNKT işçisi üçün şəxsi hesab PVZ panelindədir");
        navigate({ to: "/pvz" });
      } else if (roles.includes("seller") && !roles.includes("admin")) {
        navigate({ to: "/seller" });
      }
    });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("buyer_id", user.id).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setOrders((data ?? []) as Order[]));
    supabase.from("profiles").select("full_name,phone,shop_address,shop_city").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name ?? "");
        setPhone(data?.phone ?? "");
        setAddress(data?.shop_address ?? "");
        setCity(data?.shop_city ?? "");
      });
    supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      .then(({ count }) => setFavCount(count ?? 0));
    supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      .then(({ count }) => setCartCount(count ?? 0));
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false)
      .then(({ count }) => setUnreadMsg(count ?? 0));
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName.trim().slice(0, 100),
      phone: phone.trim().slice(0, 30),
      shop_address: address.trim().slice(0, 300) || null,
      shop_city: city.trim().slice(0, 100) || null,
    }, { onConflict: "id" });
    setSaving(false);
    if (error) toast.error(t("common.saveError"));
    else { toast.success(t("common.saved")); setEditing(false); }
  };

  const statusLabel: Record<string, string> = {
    pending: t("orders.pending"), paid: t("orders.paid"), shipped: t("orders.shipped"),
    delivered: t("orders.delivered"), cancelled: t("orders.cancelled"),
  };

  if (!user) return null;

  const displayName = fullName || user.email?.split("@")[0] || "İstifadəçi";
  const initial = (fullName || user.email || "?").charAt(0).toUpperCase();

  // Top 4 quick action tiles
  const quickTiles = [
    { icon: Clock, label: "Önceden Gezdiklerim", to: "/discover" as const },
    { icon: Tag, label: "İndirim Kuponlarım", to: "/promotions" as const },
    { icon: MessageCircle, label: "Yardım Asistanı", to: "/support" as const },
    { icon: Store, label: "Satıcı Mesajlarım", to: "/messages" as const },
  ];

  // Big two cards
  const bigCards = [
    { icon: Package, label: "Tüm Sifarişlərim", to: "/orders" as const, badge: orders.length || undefined },
    { icon: Heart, label: "Sevimlilərim", to: "/favorites" as const, badge: favCount || undefined },
    { icon: Star, label: "Rəylərim", to: "/my-reviews" as const },
    { icon: ShoppingCart, label: "Səbətim", to: "/cart" as const, badge: cartCount || undefined },
  ];

  // Hesabım menu
  const accountMenu = [
    { icon: MapPin, label: t("sidebar.addresses"), to: "/addresses" as const },
    { icon: CreditCard, label: t("sidebar.paymentMethods"), to: "/payment-methods" as const },
    { icon: Bell, label: t("sidebar.notifications"), to: "/notifications" as const, badge: unreadMsg || undefined },
    { icon: MessageCircle, label: t("sidebar.messages"), to: "/messages" as const },
    { icon: Gift, label: "Bonuslarım", to: "/bonus" as const },
    { icon: Shield, label: t("disputes.title"), to: "/disputes" as const },
    { icon: Globe, label: "Dil Dəyiş", to: "/profile" as const },
    { icon: HelpCircle, label: "Yardım & Dəstək", to: "/support" as const },
  ];

  return (
    <PanelLayout title={t("sidebar.buyerPanelTitle")} subtitle={user.email ?? undefined} items={items}>
      <div className="space-y-4 max-w-3xl mx-auto">

        {/* HEADER - Avatar + email + edit */}
        <section className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-extrabold text-primary-foreground shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            <button onClick={() => setEditing((v) => !v)} className="mt-1 text-xs font-bold text-primary inline-flex items-center gap-1">
              <Pencil className="h-3 w-3" /> {editing ? "Bağla" : "Profili düzəlt"}
            </button>
          </div>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="w-10 h-10 rounded-full border border-border hover:bg-secondary flex items-center justify-center"
            aria-label={t("profile.logout")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </section>

        {/* EDIT FORM (collapsible) */}
        {editing && (
          <section className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2"><UserIcon className="h-4 w-4 text-primary" /> {t("profile.personalInfo")}</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100}
                     placeholder={t("profile.fullName")}
                     className="h-11 px-3 rounded-lg border border-input bg-background" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} placeholder="+994 ..."
                     className="h-11 px-3 rounded-lg border border-input bg-background" />
              <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300}
                     placeholder={t("profile.addressPlaceholder")}
                     className="sm:col-span-2 h-11 px-3 rounded-lg border border-input bg-background" />
              <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} placeholder={t("profile.cityPlaceholder")}
                     className="h-11 px-3 rounded-lg border border-input bg-background" />
            </div>
            <button onClick={saveProfile} disabled={saving}
                    className="mt-3 bg-primary text-primary-foreground px-5 h-11 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-60">
              {saving ? "..." : t("common.save")}
            </button>
          </section>
        )}

        {/* QUICK TILES — 4 sütun */}
        <section className="bg-card border border-border rounded-2xl p-3">
          <div className="grid grid-cols-4 gap-2">
            {quickTiles.map((q) => (
              <Link key={q.label} to={q.to} className="flex flex-col items-center gap-1.5 py-2 hover:bg-secondary rounded-xl transition">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <q.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] md:text-xs font-semibold text-center leading-tight">{q.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* BIG CARDS — 2 sütun grid (orders, favs, reviews, cart) */}
        <section className="grid grid-cols-2 gap-3">
          {bigCards.map((c) => (
            <Link key={c.label} to={c.to}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary transition group">
              <div className="flex items-center gap-3 min-w-0">
                <c.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="font-bold text-sm truncate">{c.label}</span>
                {c.badge ? (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">{c.badge}</span>
                ) : null}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </section>

        {/* RECENT ORDERS */}
        {orders.length > 0 && (
          <section className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> {t("profile.myOrders")}</h3>
              <Link to="/orders" className="text-xs font-bold text-primary">{t("home.viewAll")} →</Link>
            </div>
            <div className="space-y-2">
              {orders.slice(0, 3).map((o) => (
                <div key={o.id} className="border border-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">№ {o.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-sm font-semibold">{new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-secondary font-bold">{statusLabel[o.status] ?? o.status}</span>
                    <span className="font-extrabold text-sm">{formatAZN(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* HESABIM MENU */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <h3 className="font-bold p-4 pb-2 flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Hesabım</h3>
          <ul className="divide-y divide-border">
            {accountMenu.map((m) => (
              <li key={m.label}>
                <Link to={m.to} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition">
                  <m.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm font-semibold">{m.label}</span>
                  {m.badge ? (
                    <span className="bg-discount text-discount-foreground text-[10px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">{m.badge}</span>
                  ) : null}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </PanelLayout>
  );
}
