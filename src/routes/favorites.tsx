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
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: favs } = await supabase.from("favorites").select("product_id").eq("user_id", user.id);
      const ids = (favs ?? []).map((f) => f.product_id);
      if (ids.length === 0) { setProducts([]); return; }
      const { data: prods } = await supabase
        .from("products")
        .select("id,title,price,old_price,image_url,rating,reviews_count,brand")
        .in("id", ids);
      setProducts((prods ?? []) as ProductCardData[]);
    })();
  }, [user]);

  if (!user) return null;

  return (
    <PanelLayout title="Şəxsi kabinet" subtitle={user.email ?? undefined} items={navItems}>
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-7 w-7 text-discount" />
          <h1 className="text-2xl md:text-3xl font-extrabold">Sevimlilərim</h1>
          <span className="text-muted-foreground text-sm">({products.length})</span>
        </div>
        {products.length === 0 ? (
          <div className="bg-secondary/40 rounded-2xl p-12 text-center text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-3 opacity-40" />
            Hələ sevimli məhsul yoxdur
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
