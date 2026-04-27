import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatAZN } from "@/lib/format";
import { Package, User as UserIcon, LogOut, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PanelLayout } from "@/components/PanelLayout";
import { useBuyerNav } from "@/hooks/useBuyerNav";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Şəxsi kabinet — One Board Market" }] }),
  component: Profile,
});

interface Order {
  id: string; total: number; status: string; created_at: string; shipping_address: string | null;
}

function Profile() {
  const { user, loading: authLoading, isSeller, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [favCount, setFavCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("buyer_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as Order[]));
    supabase.from("profiles").select("full_name,phone,shop_address,shop_city").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name ?? "");
        setPhone(data?.phone ?? "");
        setAddress(data?.shop_address ?? "");
        setCity(data?.shop_city ?? "");
      });
    supabase.from("favorites").select("*", { count: "exact", head: true }).eq("user_id", user.id)
      .then(({ count }) => setFavCount(count ?? 0));
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
    if (error) toast.error("Yadda saxlanılmadı");
    else toast.success("Yadda saxlanıldı");
  };

  const statusLabel: Record<string, string> = {
    pending: "Gözləyir", paid: "Ödənildi", shipped: "Göndərildi",
    delivered: "Çatdırıldı", cancelled: "Ləğv edildi",
  };

  if (!user) return null;

  const items: PanelNavItem[] = [
    { to: "/profile", label: "Profil", icon: UserIcon },
    { to: "/favorites", label: "Sevimlilər", icon: Heart, badge: favCount },
    ...(isSeller ? [{ to: "/seller", label: "Satıcı paneli", icon: Store }] : [{ to: "/become-seller", label: "Satıcı ol", icon: Store }]),
    ...(isAdmin ? [{ to: "/admin", label: "Admin paneli", icon: Shield }] : []),
  ];

  return (
    <PanelLayout title="Şəxsi kabinet" subtitle={user.email ?? undefined} items={items}>
      <div className="space-y-6">
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><UserIcon className="h-5 w-5 text-primary" /> Şəxsi məlumatlar</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Ad Soyad</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100}
                     className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
            </div>
            <div>
              <label className="text-sm font-semibold">Telefon</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} placeholder="+994 ..."
                     className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold flex items-center gap-1"><MapPin className="h-4 w-4" /> Çatdırılma ünvanı</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300}
                     placeholder="Məsələn: H. Əliyev pr. 12, mənzil 5"
                     className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
            </div>
            <div>
              <label className="text-sm font-semibold">Şəhər</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} placeholder="Bakı"
                     className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={saveProfile} disabled={saving}
                    className="bg-primary text-primary-foreground px-5 h-11 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-60">
              {saving ? "..." : "Yadda saxla"}
            </button>
            <button onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                    className="border border-border px-5 h-11 rounded-lg font-bold hover:bg-secondary inline-flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Çıxış
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Sifarişlərim</h2>
          {orders.length === 0 ? (
            <div className="bg-secondary/40 rounded-2xl p-10 text-center text-muted-foreground">Hələ sifariş yoxdur</div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">№ {o.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-sm">{new Date(o.created_at).toLocaleDateString("az-AZ")}</div>
                    {o.shipping_address && <div className="text-xs text-muted-foreground mt-1 max-w-md truncate">{o.shipping_address}</div>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary font-semibold">{statusLabel[o.status] ?? o.status}</span>
                    <span className="font-extrabold">{formatAZN(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PanelLayout>
  );
}
