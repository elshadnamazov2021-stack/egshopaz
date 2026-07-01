import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Store, Languages, Phone } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LiveClock } from "@/components/LiveClock";

export function SiteHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/catalog", search: { q: q || undefined, cat: undefined } as never });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center bg-gradient-brand text-white">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4">
          <SidebarTrigger className="shrink-0 text-white" />
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 hover:scale-105 transition-transform" aria-label="EG Shop">
            <span className="h-11 w-11 sm:h-14 sm:w-14 rounded-full bg-white text-primary grid place-items-center font-black text-lg shadow-lg">EG</span>
            <span className="text-xl sm:text-2xl md:text-3xl uppercase tracking-wide text-white whitespace-nowrap" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>EG Shop</span>
          </Link>
          <LiveClock compact />
          <form onSubmit={onSearch} className="flex-1 max-w-2xl hidden lg:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.searchPlaceholder")}
                className="w-full pl-10 pr-4 h-11 rounded-lg border border-white/30 bg-white/20 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition text-white placeholder:text-white/70" />
            </div>
          </form>
          <nav className="order-3 sm:order-none w-full sm:w-auto sm:ml-auto grid grid-cols-5 sm:flex items-center gap-1 sm:gap-2 pt-2 sm:pt-0 border-t border-white/15 sm:border-t-0">
            <LanguageSwitcher />
            <Link to="/catalog" search={{ q: undefined, cat: undefined } as never} className="flex flex-col items-center text-xs px-2 sm:px-3 py-1.5 hover:text-white/80 transition text-white"><Search className="h-5 w-5 mb-0.5" /><span>Kataloq</span></Link>
            <Link to="/shops" className="flex flex-col items-center text-xs px-2 sm:px-3 py-1.5 hover:text-white/80 transition text-white"><Store className="h-5 w-5 mb-0.5" /><span>Mağazalar</span></Link>
            <Link to="/promotions" className="flex flex-col items-center text-xs px-2 sm:px-3 py-1.5 hover:text-white/80 transition text-white"><Languages className="h-5 w-5 mb-0.5" /><span>Aksiya</span></Link>
            <Link to="/contact" className="flex flex-col items-center text-xs px-2 sm:px-3 py-1.5 hover:text-white/80 transition text-white"><Phone className="h-5 w-5 mb-0.5" /><span>Əlaqə</span></Link>
          </nav>
        </div>
      </div>
      <form onSubmit={onSearch} className="lg:hidden px-3 sm:px-4 pb-3 bg-gradient-brand">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")}
            className="w-full pl-10 pr-4 h-11 rounded-lg border border-white/30 bg-white/20 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition text-base sm:text-sm text-white placeholder:text-white/70" />
        </div>
      </form>
    </header>
  );
}
