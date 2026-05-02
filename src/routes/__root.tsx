import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CategoryBar } from "@/components/CategoryBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/MainSidebar";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      { title: "Elzan Shop — Azərbaycanın onlayn marketi" },
      { name: "description", content: "Milyonlarla məhsul, sürətli çatdırılma və sərfəli qiymətlər. Elzan Shop Azərbaycanda." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
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

function WorkHeader({ label }: { label: string }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center gap-3">
        <div className="font-extrabold text-primary tracking-tight">Elzan Shop · {label}</div>
        <div className="ml-auto flex items-center gap-2">
          {user && (
            <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</span>
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
  const { user, loading, isSeller, isPvz } = useAuth();
  const isSellerPanel = pathname === "/seller" || pathname.startsWith("/seller/");
  const isPvzPanel = pathname === "/pvz" || pathname.startsWith("/pvz/");
  const isAdminPanel = pathname === "/admin" || pathname.startsWith("/admin/");
  const isWorkPanel = isSellerPanel || isPvzPanel || isAdminPanel;

  useEffect(() => {
    if (loading || !user || isWorkPanel || pathname === "/auth" || pathname === "/reset-password") return;
    if (isPvz) navigate({ to: "/pvz" });
    else if (isSeller) navigate({ to: "/seller" });
  }, [loading, user, isPvz, isSeller, isWorkPanel, pathname, navigate]);

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
