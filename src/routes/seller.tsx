import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatAZN } from "@/lib/format";
import { Package, ShoppingBag, DollarSign, Plus, Trash2, Edit, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/seller")({
  head: () => ({ meta: [{ title: "Satıcı paneli — WB market" }] }),
  component: SellerPanel,
});

interface Product {
  id: string; title: string; price: number; old_price: number | null; stock: number;
  image_url: string | null; is_active: boolean; category_id: string | null; brand: string | null;
  description: string | null;
}
interface Category { id: string; name: string }
interface OrderItem { id: string; title: string; price: number; quantity: number; image_url: string | null; order_id: string }

const productSchema = z.object({
  title: z.string().trim().min(2).max(200),
  price: z.number().min(0).max(1000000),
  old_price: z.number().min(0).max(1000000).optional().nullable(),
  stock: z.number().int().min(0).max(100000),
  image_url: z.string().trim().url().max(500).or(z.literal("")).optional(),
  brand: z.string().trim().max(100).optional(),
  description: z.string().trim().max(2000).optional(),
  category_id: z.string().uuid().nullable().optional(),
});

function SellerPanel() {
  const { user, isSeller, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"dashboard" | "products" | "orders">("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
    if (!authLoading && user && !isSeller) navigate({ to: "/become-seller" });
  }, [user, isSeller, authLoading, navigate]);

  const load = async () => {
    if (!user) return;
    const [{ data: ps }, { data: cs }, { data: ois }] = await Promise.all([
      supabase.from("products").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name").order("sort_order"),
      supabase.from("order_items").select("*").eq("seller_id", user.id).order("id", { ascending: false }).limit(50),
    ]);
    setProducts((ps ?? []) as Product[]);
    setCategories((cs ?? []) as Category[]);
    setOrderItems((ois ?? []) as OrderItem[]);
  };
  useEffect(() => { if (user && isSeller) load(); }, [user, isSeller]);

  if (!user || !isSeller) return null;

  const totalRevenue = orderItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const totalOrders = new Set(orderItems.map((i) => i.order_id)).size;

  const save = async () => {
    if (!user || !editing) return;
    const payload = {
      title: editing.title ?? "",
      price: Number(editing.price ?? 0),
      old_price: editing.old_price ? Number(editing.old_price) : null,
      stock: Number(editing.stock ?? 0),
      image_url: editing.image_url ?? "",
      brand: editing.brand ?? "",
      description: editing.description ?? "",
      category_id: editing.category_id ?? null,
    };
    const v = productSchema.safeParse(payload);
    if (!v.success) { toast.error(v.error.issues[0].message); return; }

    const data = {
      ...payload,
      image_url: payload.image_url || null,
      brand: payload.brand || null,
      description: payload.description || null,
      seller_id: user.id,
      is_active: true,
    };

    if (editing.id) {
      const { error } = await supabase.from("products").update(data).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Yeniləndi");
    } else {
      const { error } = await supabase.from("products").insert(data);
      if (error) toast.error(error.message); else toast.success("Əlavə olundu");
    }
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Silinsin?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  const toggleActive = async (p: Product) => {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center gap-4 justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold">Satıcı paneli</h1>
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {(["dashboard", "products", "orders"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
              {t === "dashboard" ? "Dashboard" : t === "products" ? "Məhsullar" : "Sifarişlər"}
            </button>
          ))}
        </div>
      </div>

      {tab === "dashboard" && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: DollarSign, label: "Ümumi gəlir", value: formatAZN(totalRevenue) },
            { icon: ShoppingBag, label: "Sifarişlər", value: totalOrders },
            { icon: Package, label: "Aktiv məhsullar", value: products.filter((p) => p.is_active).length },
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

      {tab === "products" && (
        <div>
          <button onClick={() => setEditing({ title: "", price: 0, stock: 0 })}
                  className="mb-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:bg-primary/90 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Yeni məhsul
          </button>
          {products.length === 0 ? (
            <div className="bg-secondary/40 rounded-2xl p-10 text-center text-muted-foreground">Hələ məhsul yoxdur</div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-left">
                  <tr><th className="p-3">Məhsul</th><th className="p-3">Qiymət</th><th className="p-3">Stok</th><th className="p-3">Status</th><th className="p-3"></th></tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                            {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <Link to="/product/$id" params={{ id: p.id }} className="font-medium line-clamp-1 hover:text-primary">{p.title}</Link>
                        </div>
                      </td>
                      <td className="p-3 font-semibold">{formatAZN(p.price)}</td>
                      <td className="p-3">{p.stock}</td>
                      <td className="p-3">
                        <button onClick={() => toggleActive(p)} className={`text-xs px-2 py-1 rounded-full font-semibold ${p.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                          {p.is_active ? "Aktiv" : "Deaktiv"}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => setEditing(p)} className="p-2 hover:bg-secondary rounded"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => remove(p.id)} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-3">
          {orderItems.length === 0 ? (
            <div className="bg-secondary/40 rounded-2xl p-10 text-center text-muted-foreground">Hələ sifariş yoxdur</div>
          ) : orderItems.map((i) => (
            <div key={i.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-secondary rounded-lg overflow-hidden shrink-0">
                {i.image_url && <img src={i.image_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold line-clamp-1">{i.title}</div>
                <div className="text-xs text-muted-foreground">№ {i.order_id.slice(0, 8).toUpperCase()} · {i.quantity} ədəd</div>
              </div>
              <div className="font-extrabold">{formatAZN(Number(i.price) * i.quantity)}</div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{editing.id ? "Məhsulu redaktə et" : "Yeni məhsul"}</h3>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                     placeholder="Başlıq" maxLength={200} className="w-full h-11 px-3 rounded-lg border border-input bg-background" />
              <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                        placeholder="Təsvir" maxLength={2000} className="w-full px-3 py-2 rounded-lg border border-input bg-background min-h-24" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.01" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) })}
                       placeholder="Qiymət (₼)" className="h-11 px-3 rounded-lg border border-input bg-background" />
                <input type="number" step="0.01" value={editing.old_price ?? ""} onChange={(e) => setEditing({ ...editing, old_price: e.target.value ? parseFloat(e.target.value) : null })}
                       placeholder="Köhnə qiymət (ixtiyari)" className="h-11 px-3 rounded-lg border border-input bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: parseInt(e.target.value) })}
                       placeholder="Stok" className="h-11 px-3 rounded-lg border border-input bg-background" />
                <input value={editing.brand ?? ""} onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                       placeholder="Marka" maxLength={100} className="h-11 px-3 rounded-lg border border-input bg-background" />
              </div>
              <select value={editing.category_id ?? ""} onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })}
                      className="w-full h-11 px-3 rounded-lg border border-input bg-background">
                <option value="">Kateqoriya seç</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                     placeholder="Şəkil URL (https://...)" maxLength={500} className="w-full h-11 px-3 rounded-lg border border-input bg-background" />
              <button onClick={save}
                      className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90">
                Yadda saxla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
