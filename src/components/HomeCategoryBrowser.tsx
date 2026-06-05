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
  const seeAll = lang.startsWith("ru") ? "Все" : lang.startsWith("en") ? "See all" : "Hamısı";
  const backLabel = lang.startsWith("ru") ? "Назад" : lang.startsWith("en") ? "Back" : "Geri";

  return (
    <section className="space-y-4">
      {/* TAB BAR — Trendyol stil (narıncı seçilmiş, fon dolu) */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2 px-3 py-3">
          {roots.map((c) => {
            const isActive = c.id === activeRootId;
            return (
              <button
                key={c.id}
                onClick={() => selectRoot(c.id)}
                className={`min-w-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition ${
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
                 <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2 pb-1">
                  {subCats.slice(0, 12).map((s) => {
                    const hasChildren = cats.some((c) => c.parent_id === s.id);
                    return (
                       <div key={s.id} className="min-w-0">
                        {hasChildren ? (
                          <button
                            onClick={() => setActiveSubId(s.id)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-sm text-sm font-bold transition"
                          >
                            <span className="text-base">{s.icon || activeRoot.icon || "🛍️"}</span>
                            <span>{catName(s)}</span>
                          </button>
                        ) : (
                          <Link
                            to="/catalog"
                            search={{ cat: s.slug, q: undefined } as never}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-sm text-sm font-bold transition"
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

        </>
      )}
    </section>
  );
}
