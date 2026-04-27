import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Sevimlilər — One Board Market" }] }),
  component: Favorites,
});

function Favorites() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ProductCardData[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("favorites")
        .select("product:products(id,title,price,old_price,image_url,rating,reviews_count,brand)")
        .eq("user_id", user.id);
      const list = (data ?? []).map((r: { product: ProductCardData | null }) => r.product).filter(Boolean) as ProductCardData[];
      setItems(list);
    })();
  }, [user]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-7 w-7 text-discount" />
        <h1 className="text-2xl md:text-3xl font-extrabold">Sevimlilərim</h1>
        <span className="text-muted-foreground text-sm">({items.length})</span>
      </div>
      {items.length === 0 ? (
        <div className="bg-secondary/40 rounded-2xl p-12 text-center text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-3 opacity-40" />
          Hələ sevimli məhsul yoxdur
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {items.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
