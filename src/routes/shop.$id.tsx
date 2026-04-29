import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Store, MapPin, Mail, Star, Package } from "lucide-react";

export const Route = createFileRoute("/shop/$id")({
  head: ({ params }) => ({ meta: [{ title: `Shop — Elzan Shop` }, { name: "description", content: `Seller shop ${params.id}` }] }),
  component: ShopPage,
});

interface Profile {
  id: string; shop_name: string | null; full_name: string | null;
  shop_description: string | null; shop_city: string | null; shop_email: string | null;
  shop_logo_url: string | null; shop_banner_url: string | null;
}

function ShopPage() {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [stats, setStats] = useState({ count: 0, avg: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from("profiles").select("id,shop_name,full_name,shop_description,shop_city,shop_email,shop_logo_url,shop_banner_url").eq("id", id).maybeSingle(),
      supabase.from("products").select("id,title,price,old_price,image_url,rating,reviews_count,brand").eq("seller_id", id).eq("is_active", true).order("created_at", { ascending: false }),
    ]).then(([{ data: prof }, { data: prods }]) => {
      setProfile(prof as Profile | null);
      const list = (prods ?? []) as ProductCardData[];
      setProducts(list);
      const totalReviews = list.reduce((s, p) => s + (p.reviews_count || 0), 0);
      const weightedSum = list.reduce((s, p) => s + (Number(p.rating) || 0) * (p.reviews_count || 0), 0);
      setStats({ count: list.length, avg: totalReviews > 0 ? weightedSum / totalReviews : 0, reviews: totalReviews });
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-10 text-muted-foreground">{t("common.loading")}</div>;
  if (!profile) return <div className="container mx-auto px-4 py-10">{t("shop.notFound")}. <Link to="/" className="text-primary">{t("product.home")}</Link></div>;

  const name = profile.shop_name || profile.full_name || t("shop.defaultName");

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="relative h-44 md:h-60 rounded-3xl overflow-hidden bg-gradient-brand">
        {profile.shop_banner_url && <img src={profile.shop_banner_url} alt="" className="w-full h-full object-cover" />}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-5 items-start -mt-16 md:-mt-20 px-4">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-card border-4 border-card shadow-elegant overflow-hidden flex items-center justify-center shrink-0">
          {profile.shop_logo_url
            ? <img src={profile.shop_logo_url} alt={name} className="w-full h-full object-cover" />
            : <Store className="h-10 w-10 text-muted-foreground" />}
        </div>
        <div className="flex-1 pt-2 md:pt-16">
          <h1 className="text-2xl md:text-3xl font-black">{name}</h1>
          {profile.shop_description && <p className="text-muted-foreground mt-1 max-w-2xl">{profile.shop_description}</p>}
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1.5"><Package className="h-4 w-4 text-primary" /> {t("shop.productsCount", { count: stats.count })}</div>
            <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-warning fill-warning" /> <b>{stats.avg.toFixed(1)}</b> {t("shop.reviewsCount", { count: stats.reviews })}</div>
            {profile.shop_city && <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {profile.shop_city}</div>}
            {profile.shop_email && <div className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-primary" /> {profile.shop_email}</div>}
          </div>
        </div>
      </div>

      {/* Products */}
      <section>
        <h2 className="text-xl font-black mb-4">{t("shop.shopProducts")}</h2>
        {products.length === 0 ? (
          <div className="text-center py-16 bg-secondary/40 rounded-2xl text-muted-foreground">{t("shop.noProducts")}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
