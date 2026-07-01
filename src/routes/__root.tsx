import { Outlet, Link, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CategoryBar } from "@/components/CategoryBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/MainSidebar";
import { MobileTabBar } from "@/components/MobileTabBar";
import { LanguageDomSync } from "@/components/LanguageDomSync";
import "@/i18n";
import "../styles.css";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Səhifə tapılmadı</h2>
        <p className="mt-2 text-sm text-muted-foreground">Axtardığınız səhifə mövcud deyil və ya silinib.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Ana səhifəyə qayıt</Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5.0, user-scalable=yes" },
      { title: "EG Shop — statik web vitrin" },
      { name: "description", content: "EG Shop-un backenddən ayrılmış statik websayt versiyası." },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <SidebarProvider defaultOpen={false}>
      <LanguageDomSync />
      <div className="min-h-screen flex flex-col bg-background w-full">
        <MainSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <SiteHeader />
          <CategoryBar />
          <main className="flex-1 pb-20 lg:pb-0"><Outlet /></main>
          <SiteFooter />
          <MobileTabBar />
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </SidebarProvider>
  );
}
