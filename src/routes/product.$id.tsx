import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatAZN, calcDiscount } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { Star, ShoppingCart, Heart, Truck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

interface Product {
  id: string; title: string; description: string | null;
  price: number; old_price: number | null; image_url: string | null;
  rating: number; reviews_count: number; brand: string | null;
  stock: number; seller_id: string;
}

function ProductPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState<Product | null>(null);
  const [shopName, setShopName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.from("products").select("*").eq("id", id).maybeSingle().then(async ({ data }) => {
      setP(data as Product | null);
      if (data) {
        const { data: seller } = await supabase.from("profiles").select("shop_name,full_name").eq("id", data.seller_id).maybeSingle();
        setShopName(seller?.shop_name || seller?.full_name || "Satıcı");
      }
      setLoading(false);
    });
  }, [id]);

  const addToCart = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!p) return;
    const { data: existing } = await supabase.from("cart_items")
      .select("id,quantity").eq("user_id", user.id).eq("product_id", p.id).maybeSingle();
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: p.id, quantity: 1 });
    }
    toast.success("Səbətə əlavə olundu");
  };

  if (loading) return <div className="container mx-auto px-4 py-10 text-muted-foreground">Yüklənir...</div>;
  if (!p) return <div className="container mx-auto px-4 py-10">Məhsul tapılmadı. <Link to="/" className="text-primary">Ana səhifə</Link></div>;

  const discount = calcDiscount(Number(p.price), p.old_price ? Number(p.old_price) : undefined);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-primary">Ana səhifə</Link> / <span>{p.title}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-secondary rounded-2xl overflow-hidden relative">
          {p.image_url ? (
            <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">Şəkil yoxdur</div>
          )}
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-discount text-discount-foreground text-sm font-bold px-3 py-1.5 rounded-lg">
              -{discount}%
            </span>
          )}
        </div>

        <div className="space-y-4">
          {p.brand && <div className="text-sm text-muted-foreground font-semibold uppercase">{p.brand}</div>}
          <h1 className="text-2xl md:text-3xl font-extrabold">{p.title}</h1>
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-bold">{Number(p.rating).toFixed(1)}</span>
            <span className="text-muted-foreground">· {p.reviews_count} rəy</span>
          </div>

          <div className="bg-secondary/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-discount">{formatAZN(p.price)}</span>
              {p.old_price && Number(p.old_price) > Number(p.price) && (
                <span className="text-lg text-muted-foreground line-through">{formatAZN(p.old_price)}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={addToCart}
                disabled={p.stock === 0}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition"
              >
                <ShoppingCart className="h-5 w-5" />
                {p.stock === 0 ? "Stokda yoxdur" : "Səbətə əlavə et"}
              </button>
              <button
                onClick={() => toast.success("Sevimlilərə əlavə olundu")}
                className="w-12 h-12 rounded-xl border border-border hover:border-primary hover:text-primary flex items-center justify-center transition"
                aria-label="Sevimli"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              Stokda: <span className="font-semibold text-success">{p.stock} ədəd</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <span>Sürətli çatdırılma</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <span>Orijinal məhsul</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-sm text-muted-foreground">Satıcı</div>
            <div className="font-semibold">{shopName}</div>
          </div>

          {p.description && (
            <div className="pt-4 border-t border-border">
              <h3 className="font-bold mb-2">Təsvir</h3>
              <p className="text-sm text-foreground/80 whitespace-pre-line">{p.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
