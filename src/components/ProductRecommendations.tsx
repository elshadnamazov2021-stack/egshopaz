import { products } from "@/data/staticStore";
import { ProductCard } from "@/components/ProductCard";

export function ProductRecommendations({ productId, limit = 6 }: { productId?: string; limit?: number }) {
  const items = products.filter((p) => p.id !== productId).slice(0, limit);
  if (items.length === 0) return null;
  return <section className="my-8"><h2 className="text-xl md:text-2xl font-extrabold mb-4">Oxşar məhsullar</h2><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div></section>;
}
