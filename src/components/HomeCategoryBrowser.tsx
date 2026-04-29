import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { catName } from "@/lib/catName";
import { ChevronRight, Sparkles, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  name_ru?: string | null;
  name_en?: string | null;
  slug: string;
  icon: string | null;
  parent_id: string | null;
}

interface BrandRow { brand: string | null }

export function HomeCategoryBrowser() {
  const { t, i18n } = useTranslation();
  const [cats, setCats] = useState<Category[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id,name,name_ru,name_en,slug,icon,parent_id,sort_order")
      .order("sort_order")
      .then(({ data }) => {
        const list = (data ?? []) as Category[];
        setCats(list);
        const firstRoot = list.find((c) => !c.parent_id);
        if (firstRoot) setActiveId(firstRoot.id);
      });
  }, []);

  const roots = useMemo(() => cats.filter((c) => !c.parent_id), [cats]);
  const active = useMemo(() => cats.find((c) => c.id === activeId) || null, [cats, activeId]);
  const subCats = useMemo(
    () => (active ? cats.filter((c) => c.parent_id === active.id) : []),
    [cats, active],
  );

  // Aktiv kateqoriyaya aid bütün alt slug-ları topla (brendləri çıxarmaq üçün)
  const activeSlugs = useMemo(() => {
    if (!active) return [];
    const ids = new Set<string>([active.id]);
    cats.filter((c) => c.parent_id === active.id).forEach((l2) => {
      ids.add(l2.id);
      cats.filter((c) => c.parent_id === l2.id).forEach((l3) => ids.add(l3.id));
    });
    return cats.filter((c) => ids.has(c.id)).map((c) => c.slug);
  }, [cats, active]);

  useEffect(() => {
    if (activeSlugs.length === 0) {
      setBrands([]);
      return;
    }
    setLoadingBrands(true);
    supabase
      .from("products")
      .select("brand,categories!inner(slug)")
      .eq("is_active", true)
      .in("categories.slug", activeSlugs)
      .not("brand", "is", null)
      .limit(500)
      .then(({ data }) => {
        const set = new Set<string>();
        (data as BrandRow[] | null ?? []).forEach((r) => {
          if (r.brand && r.brand.trim()) set.add(r.brand.trim());
        });
        setBrands([...set].sort().slice(0, 18));
        setLoadingBrands(false);
      });
  }, [activeSlugs]);

  if (roots.length === 0) return null;

  const lang = i18n.language || "az";
  const sectionTitle = lang.startsWith("ru")
    ? "Категории"
    : lang.startsWith("en")
      ? "Categories"
      : "Kateqoriyalar";
  const featuredTitle = lang.startsWith("ru")
    ? "Популярные подкатегории"
    : lang.startsWith("en")
      ? "Featured sub-categories"
      : "Öne çıxan alt-kateqoriyalar";
  const brandsTitle = lang.startsWith("ru")
    ? "Популярные бренды"
    : lang.startsWith("en")
      ? "Featured brands"
      : "Öne çıxan brendlər";
  const seeAll = lang.startsWith("ru") ? "Все" : lang.startsWith("en") ? "See all" : "Hamısına bax";

  return (
    <section className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden">
      {/* Tab bar — root categories */}
      <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-3 scrollbar-none border-b border-border bg-secondary/30">
        {roots.map((c) => {
          const isActive = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition border ${
                isActive
                  ? "bg-gradient-brand text-primary-foreground border-transparent shadow-elegant scale-105"
                  : "bg-background border-border hover:border-primary/40 hover:text-primary"
              }`}
            >
              <span className="text-base">{c.icon}</span>
              <span className="whitespace-nowrap">{catName(c)}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="p-4 md:p-6 space-y-6">
          {/* Sub-categories */}
          <div>
            <div className="flex items-end justify-between mb-3">
              <h3 className="text-base md:text-lg font-extrabold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {featuredTitle}
              </h3>
              <Link
                to="/catalog"
                search={{ cat: active.slug, q: undefined } as never}
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                {seeAll} <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {subCats.length === 0 ? (
              <Link
                to="/catalog"
                search={{ cat: active.slug, q: undefined } as never}
                className="block rounded-2xl bg-gradient-soft p-6 text-center font-bold hover:scale-[1.01] transition"
              >
                <span className="text-3xl block mb-2">{active.icon}</span>
                {catName(active)} — {seeAll}
              </Link>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {subCats.slice(0, 12).map((s) => (
                  <Link
                    key={s.id}
                    to="/catalog"
                    search={{ cat: s.slug, q: undefined } as never}
                    className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-secondary/50 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-background flex items-center justify-center text-2xl md:text-3xl group-hover:scale-110 transition shadow-sm">
                      {s.icon || active.icon || "🛍️"}
                    </div>
                    <span className="text-[11px] md:text-xs text-center font-bold leading-tight line-clamp-2">
                      {catName(s)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Brands */}
          <div>
            <div className="flex items-end justify-between mb-3">
              <h3 className="text-base md:text-lg font-extrabold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                {brandsTitle}
              </h3>
            </div>
            {loadingBrands ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-secondary animate-pulse" />
                ))}
              </div>
            ) : brands.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">—</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {brands.map((b) => (
                  <Link
                    key={b}
                    to="/catalog"
                    search={{ cat: active.slug, brand: b, q: undefined } as never}
                    className="h-16 rounded-2xl bg-background border border-border hover:border-primary/40 hover:shadow-elegant flex items-center justify-center px-3 transition group"
                  >
                    <span className="font-extrabold text-sm md:text-base text-center line-clamp-1 group-hover:text-primary tracking-tight">
                      {b}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
