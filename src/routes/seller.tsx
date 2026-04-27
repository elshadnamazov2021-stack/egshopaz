import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatAZN } from "@/lib/format";
import { Package, ShoppingBag, DollarSign, Plus, Trash2, Edit, X, Upload, Store, TrendingUp, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/seller")({
  head: () => ({ meta: [{ title: "Satıcı paneli — WB market" }] }),
  component: SellerPanel,
});

interface Product {
  id: string; title: string; price: number; old_price: number | null; stock: number;
  image_url: string | null; images: string[]; is_active: boolean; category_id: string | null;
  brand: string | null; description: string | null; sku: string | null; weight: number | null;
  rating: number; reviews_count: number;
}
interface Category { id: string; name: string }
interface OrderItem {
  id: string; title: string; price: number; quantity: number;
  image_url: string | null; order_id: string; status: string; product_id: string;
}
interface Profile { full_name: string | null; shop_name: string | null; phone: string | null; avatar_url: string | null }

const productSchema = z.object({
  title: z.string().trim().min(2, "Başlıq minimum 2 simvol").max(200),
  price: z.number().min(0.01, "Qiymət 0-dan böyük olmalıdır").max(1000000),
  old_price: z.number().min(0).max(1000000).nullable(),
  stock: z.number().int().min(0).max(100000),
  brand: z.string().trim().max(100),
  sku: z.string().trim().max(50),
  description: z.string().trim().max(2000),
  category_id: z.string().uuid().nullable(),
  weight: z.number().min(0).max(10000).nullable(),
});

const ORDER_STATUSES = [
  { v: "pending", l: "Gözləyir", c: "bg-warning/10 text-warning" },
  { v: "processing", l: "Hazırlanır", c: "bg-primary/10 text-primary" },
  { v: "shipped", l: "Göndərildi", c: "bg-primary/10 text-primary" },
  { v: "delivered", l: "Çatdırıldı", c: "bg-success/10 text-success" },
  { v: "cancelled", l: "Ləğv edildi", c: "bg-destructive/10 text-destructive" },
];

function SellerPanel() {
  const { user, isSeller, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"dashboard" | "products" | "orders" | "shop">("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingShop, setSavingShop] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
    if (!authLoading && user && !isSeller) navigate({ to: "/become-seller" });
  }, [user, isSeller, authLoading, navigate]);

  const load = async () => {
    if (!user) return;
    const [{ data: ps }, { data: cs }, { data: ois }, { data: pr }] = await Promise.all([
      supabase.from("products").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name").order("sort_order"),
      supabase.from("order_items").select("*").eq("seller_id", user.id).order("id", { ascending: false }).limit(100),
      supabase.from("profiles").select("full_name,shop_name,phone,avatar_url").eq("id", user.id).maybeSingle(),
    ]);
    setProducts((ps ?? []) as unknown as Product[]);
    setCategories((cs ?? []) as Category[]);
    setOrderItems((ois ?? []) as unknown as OrderItem[]);
    setProfile((pr as Profile) ?? { full_name: "", shop_name: "", phone: "", avatar_url: "" });
  };
  useEffect(() => { if (user && isSeller) load(); }, [user, isSeller]);

  if (!user || !isSeller) return null;

  const totalRevenue = orderItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const totalOrders = new Set(orderItems.map((i) => i.order_id)).size;
  const pendingOrders = orderItems.filter((i) => i.status === "pending").length;
  const lowStock = products.filter((p) => p.stock < 5 && p.is_active).length;

  const uploadImages = async (files: FileList | null) => {
    if (!files || !user || !editing) return;
    setUploading(true);
    const newImages: string[] = [...(editing.images ?? [])];
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} 5MB-dan böyükdür`); continue; }
      if (!file.type.startsWith("image/")) { toast.error(`${file.name} şəkil deyil`); continue; }
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      newImages.push(data.publicUrl);
    }
    setEditing({
      ...editing,
      images: newImages,
      image_url: editing.image_url || newImages[0] || null,
    });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (url: string) => {
    if (!editing) return;
    const imgs = (editing.images ?? []).filter((i) => i !== url);
    setEditing({
      ...editing,
      images: imgs,
      image_url: editing.image_url === url ? (imgs[0] ?? null) : editing.image_url,
    });
  };

  const save = async () => {
    if (!user || !editing) return;
    const payload = {
      title: (editing.title ?? "").trim(),
      price: Number(editing.price ?? 0),
      old_price: editing.old_price ? Number(editing.old_price) : null,
      stock: Number(editing.stock ?? 0),
      brand: (editing.brand ?? "").trim(),
      sku: (editing.sku ?? "").trim(),
      description: (editing.description ?? "").trim(),
      category_id: editing.category_id ?? null,
      weight: editing.weight ? Number(editing.weight) : null,
    };
    const v = productSchema.safeParse(payload);
    if (!v.success) { toast.error(v.error.issues[0].message); return; }

    const images = editing.images ?? [];
    const data = {
      ...payload,
      images,
      image_url: editing.image_url || images[0] || null,
      brand: payload.brand || null,
      sku: payload.sku || null,
      description: payload.description || null,
      seller_id: user.id,
      is_active: editing.is_active ?? true,
    };

    if (editing.id) {
      const { error } = await supabase.from("products").update(data).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Yeniləndi");
    } else {
      const { error } = await supabase.from("products").insert(data);
      if (error) toast.error(error.message); else toast.success("Məhsul əlavə olundu");
    }
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Bu məhsul silinsin?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  const toggleActive = async (p: Product) => {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("order_items").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status yeniləndi"); load(); }
  };

  const saveShop = async () => {
    if (!user || !profile) return;
    setSavingShop(true);
    const { error } = await supabase.from("profiles").update({
      shop_name: profile.shop_name?.slice(0, 100) ?? null,
      full_name: profile.full_name?.slice(0, 100) ?? null,
      phone: profile.phone?.slice(0, 20) ?? null,
      avatar_url: profile.avatar_url ?? null,
    }).eq("id", user.id);
    if (error) toast.error(error.message); else toast.success("Mağaza məlumatları yadda saxlanıldı");
    setSavingShop(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center gap-4 justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Satıcı paneli</h1>
          {profile?.shop_name && <p className="text-sm text-muted-foreground mt-1">{profile.shop_name}</p>}
        </div>
        <div className="flex gap-1 bg-secondary rounded-xl p-1 overflow-x-auto">
          {([
            ["dashboard", "Dashboard"],
            ["products", "Məhsullar"],
            ["orders", "Sifarişlər"],
            ["shop", "Mağaza"],
          ] as const).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: DollarSign, label: "Ümumi gəlir", value: formatAZN(totalRevenue) },
              { icon: ShoppingBag, label: "Sifarişlər", value: totalOrders },
              { icon: Package, label: "Aktiv məhsullar", value: products.filter((p) => p.is_active).length },
              { icon: TrendingUp, label: "Gözləyən sifariş", value: pendingOrders },
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
          {lowStock > 0 && (
            <div className="bg-warning/10 border border-warning/20 text-warning-foreground rounded-2xl p-4">
              <strong>{lowStock}</strong> məhsulun stoku azdır (5-dən az). Stoku yeniləyin.
            </div>
          )}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Tez başlamaq</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <button onClick={() => { setTab("products"); setEditing({ title: "", price: 0, stock: 0, images: [], is_active: true }); }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-secondary/50 transition text-left">
                <Plus className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">Yeni məhsul əlavə et</span>
              </button>
              <button onClick={() => setTab("orders")}
                      className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-secondary/50 transition text-left">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">Sifarişlərə bax</span>
              </button>
              <button onClick={() => setTab("shop")}
                      className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary hover:bg-secondary/50 transition text-left">
                <Store className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">Mağaza ayarları</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "products" && (
        <div>
          <button onClick={() => setEditing({ title: "", price: 0, stock: 0, images: [], is_active: true })}
                  className="mb-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:bg-primary/90 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Yeni məhsul
          </button>
          {products.length === 0 ? (
            <div className="bg-secondary/40 rounded-2xl p-10 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">Hələ məhsul yoxdur. İlk məhsulunuzu əlavə edin.</p>
              <button onClick={() => setEditing({ title: "", price: 0, stock: 0, images: [], is_active: true })}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold">
                Məhsul əlavə et
              </button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-secondary/50 text-left">
                  <tr>
                    <th className="p-3">Məhsul</th>
                    <th className="p-3">Qiymət</th>
                    <th className="p-3">Stok</th>
                    <th className="p-3">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                            {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <Link to="/product/$id" params={{ id: p.id }} className="font-medium line-clamp-1 hover:text-primary">{p.title}</Link>
                            {p.sku && <div className="text-xs text-muted-foreground">SKU: {p.sku}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold whitespace-nowrap">{formatAZN(p.price)}</td>
                      <td className="p-3">
                        <span className={p.stock < 5 ? "text-destructive font-semibold" : ""}>{p.stock}</span>
                      </td>
                      <td className="p-3">
                        <button onClick={() => toggleActive(p)} className={`text-xs px-2 py-1 rounded-full font-semibold ${p.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                          {p.is_active ? "Aktiv" : "Deaktiv"}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => setEditing(p)} className="p-2 hover:bg-secondary rounded" title="Redaktə"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => remove(p.id)} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded" title="Sil"><Trash2 className="h-4 w-4" /></button>
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
            <div className="bg-secondary/40 rounded-2xl p-10 text-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
              Hələ sifariş yoxdur
            </div>
          ) : orderItems.map((i) => {
            const st = ORDER_STATUSES.find((s) => s.v === i.status) ?? ORDER_STATUSES[0];
            return (
              <div key={i.id} className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-4">
                <div className="w-14 h-14 bg-secondary rounded-lg overflow-hidden shrink-0">
                  {i.image_url && <img src={i.image_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold line-clamp-1">{i.title}</div>
                  <div className="text-xs text-muted-foreground">№ {i.order_id.slice(0, 8).toUpperCase()} · {i.quantity} ədəd</div>
                </div>
                <div className="font-extrabold whitespace-nowrap">{formatAZN(Number(i.price) * i.quantity)}</div>
                <select value={i.status} onChange={(e) => updateOrderStatus(i.id, e.target.value)}
                        className={`text-xs px-3 py-2 rounded-lg font-semibold border-0 ${st.c} cursor-pointer`}>
                  {ORDER_STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {tab === "shop" && profile && (
        <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> Mağaza məlumatları</h3>
          <div>
            <label className="text-sm font-semibold">Mağaza adı</label>
            <input value={profile.shop_name ?? ""} onChange={(e) => setProfile({ ...profile, shop_name: e.target.value })}
                   maxLength={100} className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
          </div>
          <div>
            <label className="text-sm font-semibold">Tam ad</label>
            <input value={profile.full_name ?? ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                   maxLength={100} className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
          </div>
          <div>
            <label className="text-sm font-semibold">Telefon</label>
            <input value={profile.phone ?? ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                   maxLength={20} placeholder="+994 ..." className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
          </div>
          <button onClick={saveShop} disabled={savingShop}
                  className="bg-primary text-primary-foreground rounded-lg px-6 h-11 font-bold hover:bg-primary/90 disabled:opacity-60">
            {savingShop ? "..." : "Yadda saxla"}
          </button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{editing.id ? "Məhsulu redaktə et" : "Yeni məhsul"}</h3>
              <button onClick={() => setEditing(null)} className="p-1 hover:bg-secondary rounded"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              {/* Images */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Şəkillər (ilk şəkil əsas olacaq)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {(editing.images ?? []).map((url, idx) => (
                    <div key={idx} className="relative aspect-square bg-secondary rounded-lg overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold">Əsas</span>}
                      <button onClick={() => removeImage(url)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                          className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-secondary/50 transition disabled:opacity-60">
                    {uploading ? <span className="text-xs">Yüklənir...</span> : <>
                      <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Şəkil əlavə et</span>
                    </>}
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                       onChange={(e) => uploadImages(e.target.files)} />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" /> JPG, PNG, WebP. Maks 5MB.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold">Başlıq *</label>
                <input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                       placeholder="Məhsulun adı" maxLength={200}
                       className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
              </div>

              <div>
                <label className="text-sm font-semibold">Təsvir</label>
                <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                          placeholder="Məhsul haqqında ətraflı məlumat" maxLength={2000}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background min-h-24" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Qiymət (₼) *</label>
                  <input type="number" step="0.01" value={editing.price ?? 0}
                         onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
                         className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Köhnə qiymət (₼)</label>
                  <input type="number" step="0.01" value={editing.old_price ?? ""}
                         onChange={(e) => setEditing({ ...editing, old_price: e.target.value ? parseFloat(e.target.value) : null })}
                         placeholder="Endirim üçün" className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">Stok *</label>
                  <input type="number" value={editing.stock ?? 0}
                         onChange={(e) => setEditing({ ...editing, stock: parseInt(e.target.value) || 0 })}
                         className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Marka</label>
                  <input value={editing.brand ?? ""} onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                         maxLength={100} className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold">SKU kodu</label>
                  <input value={editing.sku ?? ""} onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                         maxLength={50} placeholder="ART-001" className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Çəki (kq)</label>
                  <input type="number" step="0.01" value={editing.weight ?? ""}
                         onChange={(e) => setEditing({ ...editing, weight: e.target.value ? parseFloat(e.target.value) : null })}
                         className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">Kateqoriya</label>
                <select value={editing.category_id ?? ""} onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })}
                        className="mt-1 w-full h-11 px-3 rounded-lg border border-input bg-background">
                  <option value="">Seçin...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_active ?? true}
                       onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                       className="w-4 h-4" />
                <span className="text-sm font-semibold">Aktiv (mağazada göstər)</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(null)}
                        className="flex-1 h-11 border border-border rounded-lg font-bold hover:bg-secondary">
                  Ləğv et
                </button>
                <button onClick={save} disabled={uploading}
                        className="flex-1 h-11 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 disabled:opacity-60">
                  Yadda saxla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
