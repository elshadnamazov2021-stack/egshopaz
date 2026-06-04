import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { catName } from "@/lib/catName";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface Category {
  id: string;
  name: string;
  name_ru?: string | null;
  name_en?: string | null;
  slug: string;
  icon: string | null;
  parent_id: string | null;
}

export function HomeCategoryBrowser() {
  const { i18n } = useTranslation();
  const [cats, setCats] = useState<Category[]>([]);
  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id,name,name_ru,name_en,slug,icon,parent_id,sort_order")
      .order("sort_order")
      .then(({ data }) => {
        const list = (data ?? []) as Category[];
        setCats(list);
        const firstRoot = list.find((c) => !c.parent_id);
        if (firstRoot) setActiveRootId(firstRoot.id);
      });
  }, []);

  const roots = useMemo(() => cats.filter((c) => !c.parent_id), [cats]);
  const activeRoot = useMemo(
    () => cats.find((c) => c.id === activeRootId) || null,
    [cats, activeRootId],
  );
  const activeSub = useMemo(
    () => (activeSubId ? cats.find((c) => c.id === activeSubId) || null : null),
    [cats, activeSubId],
  );

  const subCats = useMemo(
    () => (activeRoot ? cats.filter((c) => c.parent_id === activeRoot.id) : []),
    [cats, activeRoot],
  );
  const leafCats = useMemo(
    () => (activeSub ? cats.filter((c) => c.parent_id === activeSub.id) : []),
    [cats, activeSub],
  );

  const current = activeSub || activeRoot;

  const selectRoot = (id: string) => {
    setActiveRootId(id);
    setActiveSubId(null);
  };

  if (roots.length === 0) return null;

  const lang = i18n.language || "az";
  const featuredTitle = lang.startsWith("ru")
    ? "Популярные категории"
    : lang.startsWith("en")
      ? "Featured Categories"
      : "Öne Çıxan Kateqoriyalar";
  const typesTitle = lang.startsWith("ru")
    ? "Типы товаров"
    : lang.startsWith("en")
      ? "Product Types"
      : "Məhsul tipləri";
  const brandsTitle = lang.startsWith("ru")
    ? "Популярные бренды"
    : lang.startsWith("en")
      ? "Featured Brands"
      : "Öne Çıxan Markalar";
  const seeAll = lang.startsWith("ru") ? "Все" : lang.startsWith("en") ? "See all" : "Hamısı";
  const backLabel = lang.startsWith("ru") ? "Назад" : lang.startsWith("en") ? "Back" : "Geri";

  // Loqo-stil rəng: brendin ilk hərfi ilə
  const brandInitialColor = (b: string) => {
    const colors = ["bg-rose-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-cyan-500", "bg-orange-500", "bg-fuchsia-500"];
    return colors[b.charCodeAt(0) % colors.length];
  };

  return (
    <section className="space-y-4">
      {/* TAB BAR — Trendyol stil (narıncı seçilmiş, fon dolu) */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex gap-1.5 overflow-x-auto px-3 py-3 scrollbar-none">
          {roots.map((c) => {
            const isActive = c.id === activeRootId;
            return (
              <button
                key={c.id}
                onClick={() => selectRoot(c.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/50 text-foreground hover:bg-secondary"
                }`}
              >
                <span>{c.icon}</span>
                <span>{catName(c)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BANNER — Slayder */}
      {banners.length > 0 && banners[bannerIdx] && (
        <div className="relative rounded-2xl overflow-hidden border-2 border-warning/40 bg-gradient-to-br from-pink-100 via-purple-100 to-violet-100 aspect-[16/5] md:aspect-[16/4] group">
          {banners[bannerIdx].image_url && /^https?:\/\//.test(banners[bannerIdx].image_url!) ? (
            <Link
              to={(banners[bannerIdx].link_url || "/catalog") as never}
              className="block w-full h-full"
            >
              <img
                src={banners[bannerIdx].image_url!}
                alt={banners[bannerIdx].title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </Link>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6">
              <h3 className="text-2xl md:text-4xl font-black text-foreground/80 text-center">
                {banners[bannerIdx].title}
              </h3>
            </div>
          )}

          {banners.length > 1 && (
            <>
              <button
                onClick={() => setBannerIdx((i) => (i - 1 + banners.length) % banners.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setBannerIdx((i) => (i + 1) % banners.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 right-3 bg-background/70 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold">
                {bannerIdx + 1}/{banners.length}
              </div>
            </>
          )}
        </div>
      )}

      {activeRoot && (
        <>
          {/* Breadcrumb / Back */}
          {activeSub && (
            <div className="flex items-center gap-2 text-sm bg-card rounded-xl border border-border px-3 py-2">
              <button
                onClick={() => setActiveSubId(null)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/70 font-bold text-xs transition"
              >
                <ArrowLeft className="h-3 w-3" /> {backLabel}
              </button>
              <span className="font-semibold text-muted-foreground">{catName(activeRoot)}</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-extrabold text-primary">{catName(activeSub)}</span>
            </div>
          )}

          {/* SƏVIYYƏ 2: Öne Çıxan Kateqoriyalar — Yalnız 1 cərgə, kompakt */}
          {!activeSub && (
            <div>
              <div className="flex items-end justify-between mb-2 px-1">
                <h3 className="text-sm md:text-base font-bold text-foreground">
                  {featuredTitle}
                </h3>
                <Link
                  to="/catalog"
                  search={{ cat: activeRoot.slug, q: undefined } as never}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  {seeAll} <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {subCats.length === 0 ? (
                <Link
                  to="/catalog"
                  search={{ cat: activeRoot.slug, q: undefined } as never}
                  className="block rounded-xl bg-card border border-border px-4 py-2 text-center text-sm font-bold hover:shadow-elegant transition"
                >
                  {catName(activeRoot)} — {seeAll}
                </Link>
              ) : (
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {subCats.slice(0, 12).map((s) => {
                    const hasChildren = cats.some((c) => c.parent_id === s.id);
                    return (
                      <div key={s.id} className="shrink-0">
                        {hasChildren ? (
                          <button
                            onClick={() => setActiveSubId(s.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-sm text-sm font-bold transition whitespace-nowrap"
                          >
                            <span className="text-base">{s.icon || activeRoot.icon || "🛍️"}</span>
                            <span>{catName(s)}</span>
                          </button>
                        ) : (
                          <Link
                            to="/catalog"
                            search={{ cat: s.slug, q: undefined } as never}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-sm text-sm font-bold transition whitespace-nowrap"
                          >
                            <span className="text-base">{s.icon || activeRoot.icon || "🛍️"}</span>
                            <span>{catName(s)}</span>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SƏVIYYƏ 3: Məhsul tipləri */}
          {activeSub && (
            <div>
              <div className="flex items-end justify-between mb-3 px-1">
                <h3 className="text-lg md:text-xl font-black text-foreground">
                  {typesTitle}
                </h3>
                <Link
                  to="/catalog"
                  search={{ cat: activeSub.slug, q: undefined } as never}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  {seeAll} <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {leafCats.length === 0 ? (
                <Link
                  to="/catalog"
                  search={{ cat: activeSub.slug, q: undefined } as never}
                  className="block rounded-2xl bg-card border border-border p-6 text-center font-bold hover:shadow-elegant transition"
                >
                  <span className="text-4xl block mb-2">{activeSub.icon}</span>
                  {catName(activeSub)} — {seeAll}
                </Link>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 md:gap-3">
                  {leafCats.slice(0, 10).map((l) => (
                    <Link
                      key={l.id}
                      to="/catalog"
                      search={{ cat: l.slug, q: undefined } as never}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-full aspect-square rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-elegant flex items-center justify-center text-5xl md:text-6xl hover:scale-[1.02] transition">
                        {l.icon || activeSub.icon || "🛍️"}
                      </div>
                      <span className="text-[11px] md:text-xs text-center font-bold leading-tight line-clamp-2 text-foreground">
                        {catName(l)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MARKALAR — ağ kartlar Trendyol stil */}
          {(loadingBrands || brands.length > 0) && (
            <div>
              <h3 className="text-lg md:text-xl font-black mb-3 px-1">
                {brandsTitle}
              </h3>
              {loadingBrands ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 md:gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-2xl bg-secondary animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-2.5 md:gap-3 overflow-x-auto scrollbar-none pb-1">
                  {brands.map((b) => (
                    <Link
                      key={b}
                      to="/catalog"
                      search={{ cat: current?.slug, brand: b, q: undefined } as never}
                      className="shrink-0 w-28 md:w-32 aspect-square rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-elegant flex items-center justify-center p-3 transition group"
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${brandInitialColor(b)} text-white flex items-center justify-center font-black text-xl md:text-2xl shadow-sm`}>
                          {b.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-black text-xs md:text-sm text-center line-clamp-1 group-hover:text-primary uppercase tracking-tight">
                          {b}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

        </>
      )}
    </section>
  );
}
