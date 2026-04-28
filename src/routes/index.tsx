import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Truck, ShieldCheck, Tag, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "One Board Market — Azərbaycanın onlayn marketi" },
      { name: "description", content: "Geyim, texnika, ev üçün mallar — sərfəli qiymətlərlə. Azərbaycan üzrə çatdırılma." },
      { property: "og:title", content: "One Board Market — Azərbaycanın onlayn marketi" },
      { property: "og:description", content: "Milyonlarla məhsul, sürətli çatdırılma." },
    ],
  }),
  component: Index,
});

interface Category { id: string; name: string; slug: string; icon: string | null }

function Index() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    supabase.from("categories").select("*").is("parent_id", null).order("sort_order").then(({ data }) => setCategories(data ?? []));
    supabase.from("products")
      .select("id,title,price,old_price,image_url,rating,reviews_count,brand")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(24)
      .then(({ data }) => setProducts((data ?? []) as ProductCardData[]));
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-10">
      {/* Categories strip */}
      <section>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/catalog"
              search={{ cat: c.slug, q: undefined } as never}
              className="shrink-0 w-24 flex flex-col items-center gap-2 group"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-soft flex items-center justify-center text-3xl group-hover:shadow-card transition">
                {c.icon}
              </div>
              <span className="text-xs text-center font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Hero banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-brand text-primary-foreground p-8 md:p-14 shadow-elegant">
        <div className="max-w-xl space-y-4 relative z-10">
          <span className="inline-block bg-background/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
            YENİ MÖVSÜM
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Azərbaycanın <br /> onlayn marketi
          </h1>
          <p className="text-base md:text-lg opacity-90">
            Milyonlarla məhsul. Sərfəli qiymətlər. Bütün ölkə üzrə sürətli çatdırılma.
          </p>
          <Link
            to="/catalog"
            search={{ q: undefined, cat: undefined } as never}
            className="inline-block bg-background text-primary px-6 py-3 rounded-xl font-bold hover:bg-background/90 transition"
          >
            Alış-verişə başla
          </Link>
        </div>
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-background/10 rounded-full blur-3xl" />
        <div className="absolute right-20 top-10 w-40 h-40 bg-background/10 rounded-full blur-2xl" />
      </section>

      {/* Benefits */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Truck, t: "Pulsuz çatdırılma", s: "50 ₼-dən yuxarı" },
          { icon: ShieldCheck, t: "Zəmanət", s: "Bütün məhsullara" },
          { icon: Tag, t: "Hər gün endirimlər", s: "70%-ə qədər" },
          { icon: Clock, t: "24/7 dəstək", s: "Hər zaman yanınızda" },
        ].map((b, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-soft flex items-center justify-center text-primary">
              <b.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-sm">{b.t}</div>
              <div className="text-xs text-muted-foreground">{b.s}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Products */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold">Sizin üçün</h2>
          <Link to="/catalog" search={{ q: undefined, cat: undefined } as never} className="text-sm text-primary font-semibold hover:underline">
            Hamısına bax →
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-16 bg-secondary/40 rounded-2xl">
            <p className="text-muted-foreground mb-2">Hələ məhsul əlavə olunmayıb</p>
            <Link to="/become-seller" className="text-primary font-semibold hover:underline">
              İlk satıcı olun →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
