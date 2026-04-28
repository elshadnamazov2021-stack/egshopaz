import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, User, Heart, LogOut, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import elzanLogo from "@/assets/elzan-logo.png";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Header with sidebar trigger
export function SiteHeader() {
  const { user, signOut, isSeller } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!user) { setCartCount(0); return; }
    let active = true;
    const load = async () => {
      const { count } = await supabase
        .from("cart_items").select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (active) setCartCount(count ?? 0);
    };
    load();
    const ch = supabase.channel("cart-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, [user]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/catalog", search: { q: q || undefined, cat: undefined } as never });
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-32 sm:h-36 flex items-center gap-4">
        <SidebarTrigger className="shrink-0" />

        <Link to="/" className="flex items-center shrink-0 drop-shadow-md hover:scale-105 transition-transform" aria-label="Elzan Shop">
          <img src={elzanLogo} alt="Elzan Shop logo" width={1024} height={512} className="h-28 sm:h-32 md:h-36 w-auto object-contain" />
        </Link>

        <form onSubmit={onSearch} className="flex-1 max-w-2xl hidden md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Məhsul, marka və ya kateqoriya axtar..."
              className="w-full pl-10 pr-4 h-11 rounded-lg border border-input bg-secondary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link to="/favorites" className="hidden sm:flex flex-col items-center text-xs px-3 py-1.5 hover:text-primary transition">
            <Heart className="h-5 w-5 mb-0.5" />
            <span>Sevimli</span>
          </Link>
          <Link to="/cart" className="relative flex flex-col items-center text-xs px-3 py-1.5 hover:text-primary transition">
            <ShoppingCart className="h-5 w-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-1 bg-discount text-discount-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span>Səbət</span>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex flex-col items-center text-xs px-3 py-1.5 hover:text-primary transition outline-none">
                <User className="h-5 w-5 mb-0.5" />
                <span>Kabinet</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                  <User className="h-4 w-4 mr-2" /> Şəxsi kabinet
                </DropdownMenuItem>
                {!isSeller && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/become-seller" })}>
                    <Store className="h-4 w-4 mr-2" /> Mağaza aç
                  </DropdownMenuItem>
                )}
                {isSeller && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/seller" })}>
                    <Store className="h-4 w-4 mr-2" /> Satıcı paneli
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Çıxış
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="flex flex-col items-center text-xs px-3 py-1.5 hover:text-primary transition">
              <User className="h-5 w-5 mb-0.5" />
              <span>Giriş</span>
            </Link>
          )}
        </nav>
      </div>

      {/* mobile search */}
      <form onSubmit={onSearch} className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Axtar..."
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-input bg-secondary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring transition text-sm"
          />
        </div>
      </form>
    </header>
  );
}
