import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { SponsoredProducts } from "@/components/SponsoredProducts";
import { CatalogFilters, type Filters } from "@/components/CatalogFilters";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().optional(),
  cat: z.string().optional(),
});

export const Route = createFileRoute("/catalog")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Kataloq — Elzan Shop" },
      { name: "description", content: "Bütün məhsullar bir yerdə. Kateqoriya, marka və qiymətə görə filter." },
    ],
  }),
  component: Catalog,
});

interface Category { id: string; name: string; slug: string; icon: string | null; parent_id: string | null }

function Catalog() {
  const { q, cat } = Route.useSearch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openParents, setOpenParents] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<Filters>({ sort: "newest" });

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => setCategories((data ?? []) as Category[]));
  }, []);

  useEffect(() => {
    setLoading(true);
    let query = supabase.from("products")
      .select("id,title,price,old_price,image_url,rating,reviews_count,brand,categories!inner(slug)")
      .eq("is_active", true);
    if (q) query = query.ilike("title", `%${q}%`);
    if (cat) query = query.eq("categories.slug", cat);
    if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
    if (filters.brand) query = query.eq("brand", filters.brand);
    if (filters.minRating) query = query.gte("rating", filters.minRating);
    if (filters.onlyDiscount) query = query.not("old_price", "is", null);

    if (filters.sort === "price_asc") query = query.order("price", { ascending: true });
    else if (filters.sort === "price_desc") query = query.order("price", { ascending: false });
    else if (filters.sort === "rating") query = query.order("rating", { ascending: false });
    else if (filters.sort === "popular") query = query.order("reviews_count", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    query.limit(80).then(({ data }) => {
      setProducts((data ?? []) as ProductCardData[]);
      setLoading(false);
    });
  }, [q, cat, filters]);

  const allBrandsList = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => p.brand && s.add(p.brand));
    return [...s].sort();
  }, [products]);

  const parents = categories.filter((c) => !c.parent_id);
  const childrenOf = (pid: string) => categories.filter((c) => c.parent_id === pid);
  const activeCat = categories.find((c) => c.slug === cat);

  useEffect(() => {
    if (activeCat?.parent_id) setOpenParents((p) => ({ ...p, [activeCat.parent_id!]: true }));
  }, [activeCat?.parent_id]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-primary">Ana səhifə</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{activeCat?.name ?? (q ? `"${q}" üzrə axtarış` : "Kataloq")}</span>
      </div>

      <div className="mb-6">
        <SponsoredProducts limit={6} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        <aside className="hidden md:block">
          <h3 className="font-bold mb-3">Kateqoriyalar</h3>
          <ul className="space-y-1">
            <li>
              <Link to="/catalog" search={{ q, cat: undefined } as never}
                    className={`block px-3 py-2 rounded-lg text-sm hover:bg-secondary ${!cat ? "bg-secondary font-semibold text-primary" : ""}`}>
                Hamısı
              </Link>
            </li>
            {parents.map((c) => {
              const kids = childrenOf(c.id);
              const isOpen = openParents[c.id] || activeCat?.parent_id === c.id || cat === c.slug;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setOpenParents((p) => ({ ...p, [c.id]: !isOpen }))}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-secondary text-left ${cat === c.slug ? "bg-secondary font-semibold text-primary" : ""}`}>
                    <span>{c.icon} {c.name}</span>
                    {kids.length > 0 && <span className="text-xs">{isOpen ? "−" : "+"}</span>}
                  </button>
                  {isOpen && kids.length > 0 && (
                    <ul className="ml-4 mt-1 space-y-0.5 border-l border-border pl-2">
                      <li>
                        <Link to="/catalog" search={{ q, cat: c.slug } as never}
                              className={`block px-2 py-1 rounded text-xs hover:bg-secondary ${cat === c.slug ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                          Hamısı
                        </Link>
                      </li>
                      {kids.map((k) => (
                        <li key={k.id}>
                          <Link to="/catalog" search={{ q, cat: k.slug } as never}
                                className={`block px-2 py-1 rounded text-xs hover:bg-secondary ${cat === k.slug ? "font-semibold text-primary" : ""}`}>
                            {k.icon} {k.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-4">
            {activeCat?.name ?? (q ? `"${q}" üzrə nəticələr` : "Bütün məhsullar")}
            <span className="ml-2 text-sm text-muted-foreground font-normal">{products.length} məhsul</span>
          </h1>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-secondary rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-secondary/40 rounded-2xl">
              <p className="text-muted-foreground">Heç bir məhsul tapılmadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {products.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
