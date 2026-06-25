import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star, Truck, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatAZN, calcDiscount } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useFavorite } from "@/hooks/useFavorite";

export interface ProductCardData {
  id: string;
  title: string;
  price: number;
  old_price: number | null;
  image_url: string | null;
  video_url?: string | null;
  rating: number;
  reviews_count: number;
  brand: string | null;
  delivery_days_min?: number | null;
  delivery_days_max?: number | null;
  delivery_city?: string | null;
  free_shipping?: boolean | null;
  fast_delivery?: boolean | null;
  stock?: number | null;
}


export function ProductCard({ p, enableFavorite = true }: { p: ProductCardData; enableFavorite?: boolean }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const { isFav, toggle: toggleFav, busy: favBusy } = useFavorite(p.id, enableFavorite);
  const discount = calcDiscount(Number(p.price), p.old_price ? Number(p.old_price) : undefined);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [videoVisible, setVideoVisible] = useState(false);

  useEffect(() => {
    if (!p.video_url || !wrapRef.current) return;
    const el = wrapRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVideoVisible(entry.isIntersecting && entry.intersectionRatio > 0.5);
          const v = videoRef.current;
          if (!v) return;
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: [0, 0.5, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [p.video_url]);


  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error(t("cart.loginRequired")); return; }
    setAdding(true);
    const { data: existing } = await supabase
      .from("cart_items").select("id, quantity")
      .eq("user_id", user.id).eq("product_id", p.id).maybeSingle();
    let error: { message: string } | null = null;
    if (existing) {
      ({ error } = await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id));
    } else {
      ({ error } = await supabase.from("cart_items").insert({ user_id: user.id, product_id: p.id, quantity: 1 }));
    }
    if (error) {
      toast.error(`Səbət yenilənmədi: ${error.message}`);
      setAdding(false);
      return;
    }
    toast.success(t("product.addToCart"));
    setAdding(false);
  };

  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className="group min-w-0 bg-card rounded-xl overflow-hidden border border-border/60 hover:border-border hover:shadow-card transition flex flex-col mobile-readable-card"
    >
      <div ref={wrapRef} className="product-image relative aspect-square sm:aspect-[3/4] bg-secondary overflow-hidden">
        {p.image_url ? (
          <img src={p.image_url} alt={p.title} loading="lazy"
               className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">—</div>
        )}
        {p.video_url && (
          <video
            ref={videoRef}
            src={p.video_url}
            muted
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${videoVisible ? "opacity-100" : "opacity-0"}`}
          />
        )}

        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-discount text-discount-foreground text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
        {enableFavorite && (
          <button
            onClick={toggleFav}
            disabled={favBusy}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center transition ${isFav ? "text-discount" : "hover:text-primary"}`}
            aria-label={t("product.addToFavorites")}
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-discount" : ""}`} />
          </button>
        )}
      </div>
      <div className="p-2 sm:p-3 flex flex-col gap-1 sm:gap-1.5 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
          <span className="text-base sm:text-lg font-extrabold leading-tight">{formatAZN(p.price)}</span>
          {p.old_price && Number(p.old_price) > Number(p.price) && (
            <span className="text-xs text-muted-foreground line-through">{formatAZN(p.old_price)}</span>
          )}
        </div>
        {p.brand && <span className="text-xs text-muted-foreground font-semibold uppercase">{p.brand}</span>}
        <p className="text-xs sm:text-sm line-clamp-2 text-foreground/80 leading-snug">{p.title}</p>
        {(p.fast_delivery || p.free_shipping || p.delivery_days_max) && (
          <div className="flex items-center gap-1 flex-wrap">
            {p.fast_delivery && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-warning/15 text-warning px-1.5 py-0.5 rounded">
                <Zap className="h-2.5 w-2.5" /> 24s
              </span>
            )}
            {p.free_shipping && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded">
                <Truck className="h-2.5 w-2.5" /> {t("catalog.freeShippingShort")}
              </span>
            )}
            {!p.fast_delivery && p.delivery_days_max ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground">
                <Truck className="h-2.5 w-2.5" />
                {p.delivery_days_min && p.delivery_days_min !== p.delivery_days_max
                  ? `${p.delivery_days_min}-${p.delivery_days_max}`
                  : p.delivery_days_max} {t("catalog.daysShort")}
              </span>
            ) : null}
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-1">
          <Star className="h-3 w-3 fill-warning text-warning" />
          <span className="font-semibold text-foreground">{Number(p.rating).toFixed(1)}</span>
          <span>· {p.reviews_count}</span>
        </div>
        <button
          onClick={addToCart}
          disabled={adding}
          className="mt-1.5 sm:mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 rounded-lg py-2 sm:py-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <ShoppingCart className="h-4 w-4 shrink-0" />
          {t("product.addToCart")}
        </button>
      </div>
    </Link>
  );
}
