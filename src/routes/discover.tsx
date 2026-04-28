import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Flame, Heart, Tag, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Kəşfet — Elzan Shop" },
      { name: "description", content: "Trend məhsullar, ən çox sevilənlər, endirimlər və yeni gələnlər bir yerdə." },
    ],
  }),
  component: Discover,
});

type Tab = "trending" | "discounted" | "favorites" | "newest" | "topRated";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: "trending", label: "Trend", icon: Flame, color: "from-orange-500 to-red-500" },
  { id: "discounted", label: "Endirimlər", icon: Tag, color: "from-rose-500 to-pink-500" },
  { id: "favorites", label: "Ən sevilənlər", icon: Heart, color: "from-pink-500 to-fuchsia-500" },
  { id: "topRated", label: "Yüksək reytinq", icon: TrendingUp, color: "from-amber-500 to-yellow-500" },
  { id: "newest", label: "Yeniliklər", icon: Sparkles, color: "from-violet-500 to-indigo-500" },
];

function Discover() {
  const [tab, setTab] = useState<Tab>("trending");
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const run = async () => {
      let q = supabase.from("products")
        .select("id,title,price,old_price,image_url,rating,reviews_count,brand")
        .eq("is_active", true);

      if (tab === "discounted") {
        q = q.not("old_price", "is", null).order("old_price", { ascending: false });
      } else if (tab === "favorites") {
        // Most-favorited via aggregate
        const { data: favAgg } = await supabase
          .from("favorites")
          .select("product_id")
          .limit(500);
        const counts = new Map<string, number>();
        (favAgg ?? []).forEach((f: { product_id: string }) => counts.set(f.product_id, (counts.get(f.product_id) ?? 0) + 1));
        const ids = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([id]) => id);
        if (ids.length === 0) { setProducts([]); setLoading(false); return; }
        const { data } = await supabase.from("products")
          .select("id,title,price,old_price,image_url,rating,reviews_count,brand")
          .in("id", ids).eq("is_active", true);
        const sorted = (data ?? []).sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
        setProducts(sorted as ProductCardData[]); setLoading(false); return;
      } else if (tab === "topRated") {
        q = q.order("rating", { ascending: false }).order("reviews_count", { ascending: false });
      } else if (tab === "newest") {
        q = q.order("created_at", { ascending: false });
      } else {
        // trending — by reviews_count + recent
        q = q.order("reviews_count", { ascending: false });
      }

      const { data } = await q.limit(40);
      setProducts((data ?? []) as ProductCardData[]);
      setLoading(false);
    };
    run();
  }, [tab]);

  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className={`rounded-3xl p-6 md:p-10 text-white bg-gradient-to-br ${active.color} shadow-elegant relative overflow-hidden`}>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-3">
            <active.icon className="h-3.5 w-3.5" /> KƏŞFET
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight">{active.label}</h1>
          <p className="opacity-90 mt-2 text-sm md:text-base">Sənin üçün ən maraqlı məhsullar bir yerdə</p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-none">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition border-2 ${
                isActive
                  ? `bg-gradient-to-r ${t.color} text-white border-transparent shadow-card`
                  : "bg-card border-border hover:border-primary text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-secondary/40 rounded-2xl">
          <p className="text-muted-foreground">Bu kateqoriyada hələ məhsul yoxdur</p>
          <Link to="/catalog" search={{ q: undefined, cat: undefined } as never}
                className="text-primary font-semibold hover:underline">Kataloqa keç →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
