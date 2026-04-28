import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { SponsoredProducts } from "@/components/SponsoredProducts";
import { SellerBanners } from "@/components/SellerBanners";
import { Truck, ShieldCheck, Tag, Clock, Flame, Heart, TicketPercent, TrendingUp, Sparkles, ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elzan Shop — Azərbaycanın onlayn marketi" },
      { name: "description", content: "Geyim, texnika, ev üçün mallar — sərfəli qiymətlərlə. Azərbaycan üzrə çatdırılma." },
      { property: "og:title", content: "Elzan Shop — Azərbaycanın onlayn marketi" },
      { property: "og:description", content: "Milyonlarla məhsul, sürətli çatdırılma." },
    ],
  }),
  component: Index,
});

interface Category { id: string; name: string; slug: string; icon: string | null }
interface PromoCode { id: string; code: string; discount_percent: number | null; discount_amount: number | null; min_order: number; expires_at: string | null }

function Index() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<ProductCardData[]>([]);
  const [discounted, setDiscounted] = useState<ProductCardData[]>([]);
  const [trending, setTrending] = useState<ProductCardData[]>([]);
  const [topFav, setTopFav] = useState<ProductCardData[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);

  useEffect(() => {
    supabase.from("categories").select("*").is("parent_id", null).order("sort_order").then(({ data }) => setCategories(data ?? []));

    supabase.from("products")
      .select("id,title,price,old_price,image_url,rating,reviews_count,brand")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setAllProducts((data ?? []) as ProductCardData[]));

    supabase.from("products")
      .select("id,title,price,old_price,image_url,rating,reviews_count,brand")
      .eq("is_active", true).not("old_price", "is", null)
      .order("old_price", { ascending: false }).limit(10)
      .then(({ data }) => setDiscounted((data ?? []) as ProductCardData[]));

    supabase.from("products")
      .select("id,title,price,old_price,image_url,rating,reviews_count,brand")
      .eq("is_active", true)
      .order("reviews_count", { ascending: false }).limit(10)
      .then(({ data }) => setTrending((data ?? []) as ProductCardData[]));

    supabase.from("promo_codes").select("*").eq("is_active", true).limit(6)
      .then(({ data }) => setPromos((data ?? []) as PromoCode[]));

    // Most-favorited
    supabase.from("favorites").select("product_id").limit(500).then(async ({ data }) => {
      const counts = new Map<string, number>();
      (data ?? []).forEach((f: { product_id: string }) => counts.set(f.product_id, (counts.get(f.product_id) ?? 0) + 1));
      const ids = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id]) => id);
      if (ids.length === 0) return;
      const { data: prod } = await supabase.from("products")
        .select("id,title,price,old_price,image_url,rating,reviews_count,brand")
        .in("id", ids).eq("is_active", true);
      const sorted = (prod ?? []).sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
      setTopFav(sorted as ProductCardData[]);
    });
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`${code} kopyalandı`);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-12">
      {/* HERO — bold gradient */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-brand text-primary-foreground p-8 md:p-16 shadow-elegant">
        <div className="max-w-2xl space-y-5 relative z-10">
          <span className="inline-flex items-center gap-2 bg-background/25 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Yeni mövsüm endirimləri
          </span>
          <h1 className="text-4xl md:text-7xl font-black leading-[0.95] tracking-tight">
            Hər şey <br /> bir yerdə.
          </h1>
          <p className="text-lg md:text-2xl opacity-95 font-medium max-w-lg">
            Milyonlarla məhsul. 70%-ə qədər endirim. Bütün ölkə üzrə pulsuz çatdırılma.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/catalog" search={{ q: undefined, cat: undefined } as never}
                  className="inline-flex items-center gap-2 bg-background text-primary px-7 py-4 rounded-xl font-extrabold hover:scale-105 transition shadow-elegant">
              Alış-verişə başla <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/discover"
                  className="inline-flex items-center gap-2 bg-background/20 backdrop-blur text-primary-foreground border-2 border-background/40 px-7 py-4 rounded-xl font-extrabold hover:bg-background/30 transition">
              <Flame className="h-5 w-5" /> Kəşfet
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-background/15 rounded-full blur-3xl" />
        <div className="absolute right-32 top-10 w-56 h-56 bg-warning/30 rounded-full blur-2xl" />
        <div className="absolute right-10 top-1/2 w-32 h-32 bg-discount/30 rounded-full blur-xl" />
      </section>

      {/* Categories — bigger, bolder */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-black">Kateqoriyalar</h2>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
          {categories.map((c) => (
            <Link key={c.id} to="/catalog" search={{ cat: c.slug, q: undefined } as never}
                  className="shrink-0 w-28 md:w-32 flex flex-col items-center gap-2 group">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-soft flex items-center justify-center text-4xl md:text-5xl group-hover:shadow-elegant group-hover:scale-105 transition border-2 border-transparent group-hover:border-primary/30">
                {c.icon}
              </div>
              <span className="text-sm text-center font-bold leading-tight">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Discount section — bold red banner with carousel */}
      {discounted.length > 0 && (
        <section className="rounded-3xl bg-gradient-to-br from-discount via-discount to-rose-700 p-6 md:p-8 text-white shadow-elegant">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Tag className="h-3.5 w-3.5" /> 70% ENDİRİM
              </div>
              <h2 className="text-2xl md:text-4xl font-black">Endirimli qiymətlər</h2>
            </div>
            <Link to="/discover" className="text-sm font-bold hover:underline whitespace-nowrap">Hamısına bax →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-white rounded-2xl p-3">
            {discounted.slice(0, 5).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {/* Promo codes — kuponlar */}
      {promos.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-success font-bold text-xs uppercase mb-1">
                <TicketPercent className="h-4 w-4" /> Aktiv kuponlar
              </div>
              <h2 className="text-2xl md:text-3xl font-black">Kuponlu məhsullar</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map((p) => (
              <div key={p.id} className="relative bg-gradient-to-r from-success via-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-card overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl" />
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-3xl font-black mb-1">
                      {p.discount_percent ? `-${p.discount_percent}%` : `-${p.discount_amount} ₼`}
                    </div>
                    <div className="text-xs opacity-90">Min. sifariş: {p.min_order} ₼</div>
                  </div>
                  <button onClick={() => copyCode(p.code)}
                          className="bg-white text-success px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 hover:scale-105 transition">
                    {p.code} <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Seller banners — paid ad zone */}
      <SellerBanners />

      {/* Trending */}
      {trending.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-card">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-bold uppercase">Hamı baxır</div>
                <h2 className="text-2xl md:text-3xl font-black">Trend məhsullar</h2>
              </div>
            </div>
            <Link to="/discover" className="text-sm text-primary font-bold hover:underline">Hamısı →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {trending.slice(0, 10).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {/* Sponsored placement */}
      <SponsoredProducts limit={6} />

      {/* Most favorited */}
      {topFav.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-500 flex items-center justify-center shadow-card">
                <Heart className="h-6 w-6 text-white fill-white" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-bold uppercase">Müştəri seçimi</div>
                <h2 className="text-2xl md:text-3xl font-black">Ən çox sevilənlər</h2>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {topFav.slice(0, 10).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { icon: Truck, t: "Pulsuz çatdırılma", s: "50 ₼-dən yuxarı", color: "from-violet-500 to-purple-500" },
          { icon: ShieldCheck, t: "Zəmanət", s: "Bütün məhsullara", color: "from-emerald-500 to-teal-500" },
          { icon: Tag, t: "Endirimlər", s: "Hər gün", color: "from-rose-500 to-pink-500" },
          { icon: Clock, t: "24/7 dəstək", s: "Hər zaman", color: "from-amber-500 to-orange-500" },
        ].map((b, i) => (
          <div key={i} className="bg-card border-2 border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 hover:shadow-card transition">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center text-white shrink-0`}>
              <b.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="font-black text-sm">{b.t}</div>
              <div className="text-xs text-muted-foreground">{b.s}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Latest products */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-card">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black">Sizin üçün</h2>
          </div>
          <Link to="/catalog" search={{ q: undefined, cat: undefined } as never} className="text-sm text-primary font-bold hover:underline">
            Hamısına bax →
          </Link>
        </div>
        {allProducts.length === 0 ? (
          <div className="text-center py-16 bg-secondary/40 rounded-2xl">
            <p className="text-muted-foreground mb-2">Hələ məhsul əlavə olunmayıb</p>
            <Link to="/become-seller" className="text-primary font-bold hover:underline">İlk satıcı olun →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {allProducts.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
