import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { products } from "@/data/staticStore";
import { ProductCard } from "@/components/ProductCard";

export function SponsoredProducts({ limit = 6 }: { limit?: number }) {
  const { t } = useTranslation();
  const items = products.slice(0, limit);
  if (items.length === 0) return null;
  return <section><div className="flex items-center gap-2 mb-4"><Sparkles className="h-5 w-5 text-warning" /><h2 className="text-xl md:text-2xl font-bold">{t("ads.sponsoredProducts")}</h2><span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full font-semibold">{t("ads.adShort")}</span></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mobile-product-grid">{items.map((p) => <div key={p.id} className="relative"><span className="absolute top-2 left-2 z-10 bg-warning text-warning-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">{t("ads.adShort")}</span><ProductCard p={p} /></div>)}</div></section>;
}
