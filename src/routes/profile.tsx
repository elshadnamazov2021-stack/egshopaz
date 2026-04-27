import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatAZN } from "@/lib/format";
import { Package, MapPin, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Şəxsi kabinet — WB market" }] }),
  component: Profile,
});

interface Order {
  id: string; total: number; status: string; created_at: string; shipping_address: string | null;
}

function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("buyer_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as Order[]));
    supabase.from("profiles").select("full_name,phone").eq("id", user.id).maybeSingle()
      .then(({ data }) => { setFullName(data?.full_name ?? ""); setPhone(data?.phone ?? ""); });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName.trim().slice(0, 100),
      phone: phone.trim().slice(0, 30),
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Yadda saxlanılmadı");
    else toast.success("Yadda saxlanıldı");
  };

  const statusLabel: Record<string, string> = {
    pending: "Gözləyir", paid: "Ödənildi", shipped: "Göndərildi",
    delivered: "Çatdırıldı", cancelled: "Ləğv edildi",
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6 grid md:grid-cols-[260px_1fr] gap-6">
      <aside className="bg-card border border-border rounded-2xl p-4 h-fit space-y-1">
        <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border mb-2">{user.email}</div>
        <a href="#profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm"><UserIcon className="h-4 w-4" /> Profil</a>
        <a href="#orders" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm"><Package className="h-4 w-4" /> Sifarişlərim</a>
        <Link to="/become-seller" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm"><MapPin className="h-4 w-4" /> Satıcı ol</Link>
      </aside>

      <div className="space-y-6">
        <section id="profile" className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Profil</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100}
                   placeholder="Ad Soyad" className="h-11 px-3 rounded-lg border border-input bg-background" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30}
                   placeholder="Telefon" className="h-11 px-3 rounded-lg border border-input bg-background" />
          </div>
          <button onClick={saveProfile} disabled={saving}
                  className="mt-4 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-60">
            {saving ? "..." : "Yadda saxla"}
          </button>
        </section>

        <section id="orders">
          <h2 className="text-xl font-bold mb-4">Sifarişlərim</h2>
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
    </div>
  );
}
