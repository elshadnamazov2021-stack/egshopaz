import { Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { categories } from "@/data/staticStore";
import { catName } from "@/lib/catName";
import { ChevronRight, ChevronLeft } from "lucide-react";

export function HomeCategoryBrowser() {
  const { t } = useTranslation();
  const roots = useMemo(() => categories.filter((c) => !c.parent_id), []);
  const [activeRootId, setActiveRootId] = useState(roots[0]?.id ?? null);
  const activeRoot = categories.find((c) => c.id === activeRootId) || null;
  const subCats = activeRoot ? categories.filter((c) => c.parent_id === activeRoot.id) : [];
  const rootScrollRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: "left" | "right") => rootScrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  if (!activeRoot) return null;
  return <section className="space-y-4 min-w-0 max-w-full overflow-hidden"><div className="bg-card rounded-2xl border border-border overflow-hidden min-w-0 max-w-full"><div className="flex items-center gap-1 px-1"><button type="button" onClick={() => scrollBy("left")} className="hidden lg:inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-secondary"><ChevronLeft className="h-4 w-4" /></button><div ref={rootScrollRef} className="flex-1 flex w-full max-w-full gap-2 px-2 py-3 overflow-x-auto overscroll-x-contain scrollbar-responsive">{roots.map((c) => <button key={c.id} onClick={() => setActiveRootId(c.id)} className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${c.id === activeRootId ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary/50 text-foreground hover:bg-secondary"}`}><span>{c.icon}</span><span>{catName(c)}</span></button>)}</div><button type="button" onClick={() => scrollBy("right")} className="hidden lg:inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-secondary"><ChevronRight className="h-4 w-4" /></button></div></div><div><div className="flex items-end justify-between mb-2 px-1"><h3 className="text-sm md:text-base font-bold text-foreground">{t("categoryBar.featuredCategories")}</h3><Link to="/catalog" search={{ cat: activeRoot.slug, q: undefined } as never} className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">{t("common.all")} <ChevronRight className="h-3 w-3" /></Link></div><div className="flex gap-2 pb-1 overflow-x-auto overscroll-x-contain scrollbar-responsive">{(subCats.length ? subCats : [activeRoot]).map((s) => <Link key={s.id} to="/catalog" search={{ cat: s.slug, q: undefined } as never} className="shrink-0 w-36 sm:w-40 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-sm text-sm font-bold transition"><span className="text-base">{s.icon || activeRoot.icon || "🛍️"}</span><span className="truncate">{catName(s)}</span></Link>)}</div></div></section>;
}
