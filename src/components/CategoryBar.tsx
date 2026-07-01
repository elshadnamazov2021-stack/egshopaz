import { Link, useLocation } from "@tanstack/react-router";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { categories } from "@/data/staticStore";
import { catName } from "@/lib/catName";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CategoryBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  if (location.pathname === "/") return null;
  const roots = categories.filter((c) => !c.parent_id);
  const scrollBy = (dir: "left" | "right") => scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  return <div className="sticky top-44 sm:top-36 z-40 bg-background/95 backdrop-blur border-b border-border shadow-sm"><div className="container mx-auto px-4"><div className="flex items-center gap-1"><button type="button" onClick={() => scrollBy("left")} className="hidden lg:inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-secondary hover:bg-primary/10"><ChevronLeft className="h-4 w-4" /></button><div ref={scrollRef} className="flex-1 flex gap-2 md:gap-3 overflow-x-auto py-3 scrollbar-responsive"><Link to="/catalog" search={{ cat: undefined, q: undefined } as never} className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-brand text-primary-foreground font-bold text-sm shadow-sm"><span className="text-lg">🛍️</span><span>{t("categoryBar.all")}</span></Link>{roots.map((c) => <Link key={c.id} to="/catalog" search={{ cat: c.slug, q: undefined } as never} className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary font-semibold text-sm transition"><span className="text-lg">{c.icon}</span><span className="whitespace-nowrap">{catName(c)}</span></Link>)}</div><button type="button" onClick={() => scrollBy("right")} className="hidden lg:inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-secondary hover:bg-primary/10"><ChevronRight className="h-4 w-4" /></button></div></div></div>;
}
