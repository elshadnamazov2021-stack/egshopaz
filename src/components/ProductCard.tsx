import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { formatAZN, calcDiscount } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { useFavorite } from "@/hooks/useFavorite";

export interface ProductCardData {
  id: string;
  title: string;
  price: number;
  old_price: number | null;
  image_url: string | null;
  rating: number;
  reviews_count: number;
  brand: string | null;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const { isFav, toggle: toggleFav } = useFavorite(p.id);
  const discount = calcDiscount(Number(p.price), p.old_price ? Number(p.old_price) : undefined);

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Səbətə əlavə etmək üçün daxil olun"); return; }
    setAdding(true);
    const { data: existing } = await supabase
      .from("cart_items").select("id, quantity")
      .eq("user_id", user.id).eq("product_id", p.id).maybeSingle();
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: p.id, quantity: 1 });
    }
    toast.success("Səbətə əlavə olundu");
    setAdding(false);
  };

  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className="group bg-card rounded-xl overflow-hidden border border-transparent hover:border-border hover:shadow-card transition flex flex-col"
    >
      <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
        {p.image_url ? (
          <img src={p.image_url} alt={p.title} loading="lazy"
               className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Şəkil yoxdur</div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-discount text-discount-foreground text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
        <button
          onClick={toggleFav}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center transition ${isFav ? "text-discount" : "hover:text-primary"}`}
          aria-label="Sevimli"
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-discount" : ""}`} />
        </button>
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold">{formatAZN(p.price)}</span>
          {p.old_price && Number(p.old_price) > Number(p.price) && (
            <span className="text-xs text-muted-foreground line-through">{formatAZN(p.old_price)}</span>
          )}
        </div>
        {p.brand && <span className="text-xs text-muted-foreground font-semibold uppercase">{p.brand}</span>}
        <p className="text-sm line-clamp-2 text-foreground/80">{p.title}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-1">
          <Star className="h-3 w-3 fill-warning text-warning" />
          <span className="font-semibold text-foreground">{Number(p.rating).toFixed(1)}</span>
          <span>· {p.reviews_count} rəy</span>
        </div>
        <button
          onClick={addToCart}
          disabled={adding}
          className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <ShoppingCart className="h-4 w-4" />
          Səbətə
        </button>
      </div>
    </Link>
  );
}
