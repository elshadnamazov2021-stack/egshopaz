import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Home, LayoutGrid, Store, Flame, Tag, HelpCircle, MapPin } from "lucide-react";
import { categories } from "@/data/staticStore";
import { catName } from "@/lib/catName";

export function MainSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();
  const close = () => { if (isMobile) setOpenMobile(false); };
  const isHome = location.pathname === "/";
  const mainLinks = [
    { to: "/", label: t("sidebar.home"), icon: Home },
    { to: "/catalog", label: t("sidebar.catalog"), icon: LayoutGrid, search: { q: undefined, cat: undefined } as never },
    { to: "/shops", label: t("sidebar.shops"), icon: Store },
    { to: "/discover", label: t("sidebar.discover"), icon: Flame },
    { to: "/promotions", label: t("sidebar.promotions"), icon: Tag },
    { to: "/pickup-points", label: "PVZ", icon: MapPin },
  ];
  const parents = categories.filter((c) => !c.parent_id);
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" onClick={close} className="flex items-center gap-2 font-extrabold text-xl px-2 py-2"><span className="bg-gradient-brand text-primary-foreground px-2 py-1 rounded-md">EG Shop</span><span className="text-gradient-brand">market</span></Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup><SidebarGroupLabel>{t("sidebar.mainMenu")}</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{mainLinks.map((l) => (<SidebarMenuItem key={l.to}><SidebarMenuButton asChild><Link to={l.to} search={l.search} onClick={close}><l.icon className="h-4 w-4" /><span>{l.label}</span></Link></SidebarMenuButton></SidebarMenuItem>))}</SidebarMenu></SidebarGroupContent></SidebarGroup>
        {!isHome && <SidebarGroup><SidebarGroupLabel>{t("sidebar.categories")}</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{parents.map((p) => (<SidebarMenuItem key={p.id}><SidebarMenuButton asChild><Link to="/catalog" search={{ cat: p.slug, q: undefined } as never} onClick={close}><span className="text-base">{p.icon}</span><span>{catName(p)}</span></Link></SidebarMenuButton></SidebarMenuItem>))}</SidebarMenu></SidebarGroupContent></SidebarGroup>}
        <SidebarGroup><SidebarGroupContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton asChild><Link to="/contact" onClick={close}><HelpCircle className="h-4 w-4" /><span>{t("sidebar.support")}</span></Link></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroupContent></SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
