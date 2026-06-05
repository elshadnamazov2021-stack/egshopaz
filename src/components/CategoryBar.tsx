import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { catName } from "@/lib/catName";

interface Category { id: string; name: string; name_ru?: string | null; name_en?: string | null; slug: string; icon: string | null }

export function CategoryBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [cats, setCats] = useState<Category[]>([]);
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (isHome) return;
    supabase
      .from("categories")
      .select("id,name,name_ru,name_en,slug,icon")
      .is("parent_id", null)
      .order("sort_order")
      .then(({ data }) => setCats((data ?? []) as Category[]));
  }, [isHome]);

  // Ana səhifədə HomeCategoryBrowser göstərilir, bu bar yalnız digər səhifələrdə görünür
  if (isHome) return null;
  if (cats.length === 0) return null;

  return (
    <div className="sticky top-44 sm:top-36 z-40 bg-background/95 backdrop-blur border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 md:gap-3 overflow-x-auto py-3 scrollbar-none">
          <Link
            to="/catalog"
            search={{ cat: undefined, q: undefined } as never}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-brand text-primary-foreground font-bold text-sm hover:scale-105 transition shadow-sm"
          >
            <span className="text-lg">🛍️</span>
            <span>{t("categoryBar.all")}</span>
          </Link>
          {cats.map((c) => (
            <Link
              key={c.id}
              to="/catalog"
              search={{ cat: c.slug, q: undefined } as never}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary font-semibold text-sm transition border border-transparent hover:border-primary/30"
            >
              <span className="text-lg">{c.icon}</span>
              <span className="whitespace-nowrap">{catName(c)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
