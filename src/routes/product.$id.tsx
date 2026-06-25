import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { formatAZN, calcDiscount } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { Star, ShoppingCart, Heart, Truck, ShieldCheck, MessageCircle, Send, Store, MapPin, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { ProductReviews } from "@/components/ProductReviews";
import { CompareButton } from "@/components/CompareButton";
import { ProductRecommendations } from "@/components/ProductRecommendations";
import { useFavorite } from "@/hooks/useFavorite";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

interface Product {
  id: string; title: string; description: string | null;
  price: number; old_price: number | null; image_url: string | null;
  images?: string[] | null;
  rating: number; reviews_count: number; brand: string | null;
  stock: number; seller_id: string;
  video_url?: string | null; video_duration?: number | null;
}

function ProductPage() {
  const { id } = Route.useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isFav, toggle: toggleFavorite, busy: favoriteBusy } = useFavorite(id);
  const [p, setP] = useState<Product | null>(null);
  const [shopName, setShopName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgBody, setMsgBody] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [shopInfo, setShopInfo] = useState<{
    id: string; shop_name: string | null; full_name: string | null;
    shop_logo_url: string | null; shop_description: string | null; shop_city: string | null;
  } | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const sendMessage = async () => {
    if (!user) { navigate({ to: "/auth", search: { role: "buyer" } as never }); return; }
    if (!p) return;
    const body = msgBody.trim();
    if (body.length < 2) { toast.error(t("orders.messageShort")); return; }
    if (user.id === p.seller_id) { toast.error(t("orders.ownShopError")); return; }
    setMsgSending(true);
    const { error } = await supabase.from("shop_messages").insert({
      buyer_id: user.id,
      seller_id: p.seller_id,
      product_id: p.id,
      sender_role: "buyer",
      body,
    });
    setMsgSending(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("product.msgSent"));
    setMsgBody("");
    setMsgOpen(false);
  };

  const toggleFollow = async () => {
    if (!user) { navigate({ to: "/auth", search: { role: "buyer" } as never }); return; }
    if (!p) return;
    if (user.id === p.seller_id) { toast.error("Öz mağazanızı izləyə bilməzsiniz"); return; }
    if (isFollowing) {
      await supabase.from("shop_followers").delete().eq("user_id", user.id).eq("seller_id", p.seller_id);
      setIsFollowing(false);
      setFollowersCount((c) => Math.max(0, c - 1));
      toast.success("İzləməkdən çıxarıldı");
    } else {
      const { error } = await supabase.from("shop_followers").insert({ user_id: user.id, seller_id: p.seller_id });
      if (error) { toast.error(error.message); return; }
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
      toast.success("Mağaza izlənildi 💙");
    }
  };

  useEffect(() => {
    setLoading(true);
    supabase.from("products").select("*").eq("id", id).maybeSingle().then(async ({ data }) => {
      setP(data as Product | null);
      if (data) {
        const [{ data: seller }, { count }] = await Promise.all([
          supabase.from("profiles").select("id,shop_name,full_name,shop_logo_url,shop_description,shop_city").eq("id", data.seller_id).maybeSingle(),
          supabase.from("shop_followers").select("id", { count: "exact", head: true }).eq("seller_id", data.seller_id),
        ]);
        const name = seller?.shop_name || seller?.full_name || t("product.seller");
        setShopName(name);
        setShopInfo(seller as any);
        setFollowersCount(count ?? 0);
        if (user) {
          const { data: f } = await supabase.from("shop_followers").select("id").eq("user_id", user.id).eq("seller_id", data.seller_id).maybeSingle();
          setIsFollowing(!!f);
        }
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const addToCart = async () => {
    if (!user) { navigate({ to: "/auth", search: { role: "buyer" } as never }); return; }
    if (!p) return;
    const { data: existing } = await supabase.from("cart_items")
      .select("id,quantity").eq("user_id", user.id).eq("product_id", p.id).maybeSingle();
    let error: { message: string } | null = null;
    if (existing) {
      if (existing.quantity >= p.stock) {
        toast.error(`Maksimum stok: ${p.stock} ədəd`);
        return;
      }
      ({ error } = await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id));
    } else {
      ({ error } = await supabase.from("cart_items").insert({ user_id: user.id, product_id: p.id, quantity: 1 }));
    }
    if (error) { toast.error(`Səbət yenilənmədi: ${error.message}`); return; }
    toast.success(t("product.addedToCart"));
  };

  if (loading) return <div className="container mx-auto px-4 py-10 text-muted-foreground">{t("common.loading")}</div>;
  if (!p) return <div className="container mx-auto px-4 py-10">{t("product.notFound")}. <Link to="/" className="text-primary">{t("product.home")}</Link></div>;

  const discount = calcDiscount(Number(p.price), p.old_price ? Number(p.old_price) : undefined);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-primary">{t("product.home")}</Link> / <span>{p.title}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="aspect-square bg-secondary rounded-2xl overflow-hidden relative">
            {p.image_url ? (
              <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">{t("product.noImage")}</div>
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-discount text-discount-foreground text-sm font-bold px-3 py-1.5 rounded-lg">
                -{discount}%
              </span>
            )}
          </div>
          {p.video_url && (
            <div className="rounded-2xl overflow-hidden bg-black relative">
              <video src={p.video_url} controls playsInline className="w-full max-h-96" />
              <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                🎬 Video {p.video_duration ? `· ${p.video_duration}san` : ""}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {p.brand && <div className="text-sm text-muted-foreground font-semibold uppercase">{p.brand}</div>}
          <h1 className="text-2xl md:text-3xl font-extrabold">{p.title}</h1>
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-bold">{Number(p.rating).toFixed(1)}</span>
            <span className="text-muted-foreground">· {t("product.reviewsShort", { count: p.reviews_count })}</span>
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
                {p.stock === 0 ? t("product.outOfStock") : t("product.addToCart")}
              </button>
              <button
                onClick={toggleFavorite}
                disabled={favoriteBusy}
                className="w-12 h-12 rounded-xl border border-border hover:border-primary hover:text-primary flex items-center justify-center transition"
                aria-label={t("product.favoriteAria")}
              >
                <Heart className={`h-5 w-5 ${isFav ? "fill-discount text-discount" : ""}`} />
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              {t("product.stockLabel")}: <span className="font-semibold text-success">{t("product.stockUnits", { count: p.stock })}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <span>{t("product.fastDelivery")}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <span>{t("product.originalProduct")}</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Link to="/shop/$id" params={{ id: p.seller_id }} className="shrink-0">
                <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden flex items-center justify-center">
                  {shopInfo?.shop_logo_url
                    ? <img src={shopInfo.shop_logo_url} alt={shopName} className="w-full h-full object-cover" />
                    : <Store className="h-5 w-5 text-muted-foreground" />}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link to="/shop/$id" params={{ id: p.seller_id }} className="font-bold hover:text-primary inline-flex items-center gap-1.5">
                  <Store className="h-4 w-4" /> {shopName}
                </Link>
                {shopInfo?.shop_description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{shopInfo.shop_description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  {shopInfo?.shop_city && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{shopInfo.shop_city}</span>}
                  <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" />{followersCount} izləyici</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {user?.id !== p.seller_id && (
                <button
                  onClick={toggleFollow}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-sm transition ${isFollowing ? "bg-primary/10 text-primary border border-primary/30" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                >
                  <Heart className={`h-4 w-4 ${isFollowing ? "fill-primary" : ""}`} />
                  {isFollowing ? "İzlənilir" : "İzlə"}
                </button>
              )}
              {user?.id !== p.seller_id && (
                <button
                  onClick={() => setMsgOpen((v) => !v)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border hover:border-primary hover:text-primary transition font-semibold text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t("product.writeShop")}
                </button>
              )}
            </div>

            {msgOpen && (
              <div className="mt-1 bg-secondary/50 border border-border rounded-xl p-3 space-y-2">
                <textarea
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder={t("product.shopMsgPlaceholder")}
                  rows={3}
                  className="w-full p-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setMsgOpen(false); setMsgBody(""); }}
                    className="text-sm px-3 py-1.5 rounded-lg hover:bg-secondary"
                  >
                    {t("orders.cancelShort")}
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={msgSending || msgBody.trim().length < 2}
                    className="text-sm px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {msgSending ? "..." : t("common.send")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {p.description && (
            <div className="pt-4 border-t border-border">
              <h3 className="font-bold mb-2">{t("product.description")}</h3>
              <p className="text-sm text-foreground/80 whitespace-pre-line">{p.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 space-y-10">
        <ProductRecommendations mode="together" productId={p.id} />
        <ProductRecommendations mode="for_you" />
        <ProductReviews productId={p.id} />
      </div>
      <div className="fixed bottom-20 right-4 z-40 md:bottom-8">
        <CompareButton productId={p.id} />
      </div>
    </div>
  );
}
