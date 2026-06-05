import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation, useNavigate } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CategoryBar } from "@/components/CategoryBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/MainSidebar";
import { LogOut, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import "@/i18n";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Səhifə tapılmadı</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Axtardığınız səhifə mövcud deyil və ya köçürülüb.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition">
            Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EG Shop — Azərbaycanın onlayn marketi" },
      { name: "description", content: "Milyonlarla məhsul, sürətli çatdırılma və sərfəli qiymətlər. EG Shop Azərbaycanda." },
      { property: "og:title", content: "EG Shop — Azərbaycanın onlayn marketi" },
      { name: "twitter:title", content: "EG Shop — Azərbaycanın onlayn marketi" },
      { property: "og:description", content: "Milyonlarla məhsul, sürətli çatdırılma və sərfəli qiymətlər. EG Shop Azərbaycanda." },
      { name: "twitter:description", content: "Milyonlarla məhsul, sürətli çatdırılma və sərfəli qiymətlər. EG Shop Azərbaycanda." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3c5472a7-d4ed-4606-9418-2239a7902322/id-preview-9aa023f3--ce089083-d587-4e6d-8fae-500699d0362d.lovable.app-1780491005862.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3c5472a7-d4ed-4606-9418-2239a7902322/id-preview-9aa023f3--ce089083-d587-4e6d-8fae-500699d0362d.lovable.app-1780491005862.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const date = now.toLocaleDateString("az-AZ", { weekday: "short", day: "2-digit", month: "short" });
  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 border border-border">
      <Clock className="h-4 w-4 text-primary shrink-0" />
      <div className="min-w-0 text-right">
        <div className="font-mono font-bold text-sm tabular-nums leading-tight">{time}</div>
        <div className="text-[10px] text-muted-foreground capitalize leading-tight">{date}</div>
      </div>
    </div>
  );
}

function WorkHeader({ label }: { label: string }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center gap-3">
        <div className="font-extrabold text-primary tracking-tight">EG Shop · {label}</div>
        <div className="ml-auto flex items-center gap-3">
          <LiveClock />
          {user && (
            <span className="hidden md:inline text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</span>
          )}
          {user && (
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}>
              <LogOut className="h-4 w-4 mr-1" /> Çıxış
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isSeller, isAdmin, isPvz, loading } = useAuth();
  const isSellerPanel = pathname === "/seller" || pathname.startsWith("/seller/");
  const isPvzPanel = pathname === "/pvz" || pathname.startsWith("/pvz/");
  const isAdminPanel = pathname === "/admin" || pathname.startsWith("/admin/");
  const isWorkPanel = isSellerPanel || isPvzPanel || isAdminPanel;
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/") || pathname === "/reset-password";

  // Subdomain-based routing: seller.* / admin.* / pvz.* avtomatik öz panelinə açılır
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sub = window.location.hostname.split(".")[0].toLowerCase();
    const map: Record<string, string> = { seller: "/seller", satici: "/seller", admin: "/admin", pvz: "/pvz" };
    const target = map[sub];
    if (!target || isAuthRoute) return;
    if (pathname === target || pathname.startsWith(target + "/")) return;
    navigate({ to: target, replace: true });
  }, [pathname, isAuthRoute, navigate]);

  // Sellers (without admin/pvz) should only use the seller panel — block customer-side pages
  useEffect(() => {
    if (loading) return;
    if (isSeller && !isAdmin && !isPvz && !isWorkPanel && !isAuthRoute) {
      navigate({ to: "/seller", replace: true });
    }
  }, [loading, isSeller, isAdmin, isPvz, isWorkPanel, isAuthRoute, pathname, navigate]);

  if (isSeller && !isAdmin && !isPvz && !isWorkPanel && !isAuthRoute) {
    return null;
  }

  if (isWorkPanel) {
    const label = isSellerPanel ? "Satıcı paneli" : isPvzPanel ? "PVZ PUNKT paneli" : "Admin";
    return (
      <div className="min-h-screen flex flex-col bg-background w-full">
        <WorkHeader label={label} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }


  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex flex-col bg-background w-full">
        <MainSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <SiteHeader />
          <CategoryBar />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <AppShell />
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}
