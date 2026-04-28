import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

interface SponsoredItem {
  id: string;
  product_id: string;
  products: {
    id: string;
    title: string;
    price: number;
    old_price: number | null;
    image_url: string | null;
    images: string[];
    rating: number;
  } | null;
}

export function SponsoredProducts({ limit = 6 }: { limit?: number }) {
  const [items, setItems] = useState<SponsoredItem[]>([]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("sponsored_products")
        .select("id, product_id, products(id, title, price, old_price, image_url, images, rating)")
        .eq("is_active", true)
        .gt("ends_at", new Date().toISOString())
        .limit(limit);
      setItems((data ?? []) as unknown as SponsoredItem[]);
    })();
  }, [limit]);

  if (items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 my-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-warning" />
        <h2 className="text-xl font-bold">Sponsor məhsullar</h2>
        <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full font-semibold">REKLAM</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((s) => s.products && (
          <Link key={s.id} to="/product/$id" params={{ id: s.products.id }} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition group">
            <div className="aspect-square bg-secondary overflow-hidden">
              {(s.products.image_url ?? s.products.images[0]) && (
                <img src={s.products.image_url ?? s.products.images[0]} alt={s.products.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
              )}
            </div>
            <div className="p-2">
              <div className="text-xs line-clamp-2 mb-1">{s.products.title}</div>
              <div className="font-bold text-sm">{s.products.price.toFixed(2)} ₼</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
