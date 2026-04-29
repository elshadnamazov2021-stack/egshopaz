import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import {
  Home, LayoutGrid, Heart, ShoppingCart, MessageCircle, Package,
  Bell, Tag, Gift, Store, User, HelpCircle, ChevronDown, ChevronRight, Shield, PackageOpen, Flame,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Category { id: string; name: string; name_ru?: string | null; name_en?: string | null; slug: string; icon: string | null; parent_id: string | null }

export function MainSidebar() {
  const { user, isSeller } = useAuth();
  const { t } = useTranslation();
  const { setOpenMobile, isMobile } = useSidebar();
  const [cats, setCats] = useState<Category[]>([]);
  const [openCat, setOpenCat] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => {
      setCats((data ?? []) as Category[]);
    });
  }, []);

  const close = () => { if (isMobile) setOpenMobile(false); };

  const parents = cats.filter((c) => !c.parent_id);
  const childrenOf = (pid: string) => cats.filter((c) => c.parent_id === pid);

  const mainLinks = [
    { to: "/", label: t("sidebar.home"), icon: Home },
    { to: "/catalog", label: t("sidebar.catalog"), icon: LayoutGrid, search: { q: undefined, cat: undefined } as never },
    { to: "/discover", label: t("sidebar.discover"), icon: Flame },
    { to: "/promotions", label: t("sidebar.promotions"), icon: Tag },
    { to: "/bonus", label: t("sidebar.bonuses"), icon: Gift },
  ];

  const userLinks = user ? [
    { to: "/profile", label: t("sidebar.profile"), icon: User },
    { to: "/orders", label: t("sidebar.orders"), icon: Package },
    { to: "/favorites", label: t("sidebar.favorites"), icon: Heart },
    { to: "/cart", label: t("sidebar.cart"), icon: ShoppingCart },
    { to: "/messages", label: t("sidebar.messages"), icon: MessageCircle },
    { to: "/notifications", label: t("sidebar.notifications"), icon: Bell },
  ] : [];

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" onClick={close} className="flex items-center gap-2 font-extrabold text-xl px-2 py-2">
          <span className="bg-gradient-brand text-primary-foreground px-2 py-1 rounded-md">Elzan Shop</span>
          <span className="text-gradient-brand">market</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.mainMenu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainLinks.map((l) => (
                <SidebarMenuItem key={l.to}>
                  <SidebarMenuButton asChild>
                    <Link to={l.to} search={l.search} onClick={close}>
                      <l.icon className="h-4 w-4" />
                      <span>{l.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.categories")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {parents.map((p) => {
                const kids = childrenOf(p.id);
                const open = openCat === p.id;
                return (
                  <SidebarMenuItem key={p.id}>
                    {kids.length > 0 ? (
                      <>
                        <SidebarMenuButton onClick={() => setOpenCat(open ? null : p.id)}>
                          <span className="text-base">{p.icon}</span>
                          <span className="flex-1 text-left">{p.name}</span>
                          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </SidebarMenuButton>
                        {open && (
                          <ul className="ml-7 mt-1 space-y-1 border-l border-sidebar-border pl-2">
                            <li>
                              <Link
                                to="/catalog"
                                search={{ cat: p.slug, q: undefined } as never}
                                onClick={close}
                                className="block text-xs py-1.5 px-2 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium"
                              >
                                {t("common.all")}
                              </Link>
                            </li>
                            {kids.map((k) => (
                              <li key={k.id}>
                                <Link
                                  to="/catalog"
                                  search={{ cat: k.slug, q: undefined } as never}
                                  onClick={close}
                                  className="block text-xs py-1.5 px-2 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                >
                                  {k.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <SidebarMenuButton asChild>
                        <Link to="/catalog" search={{ cat: p.slug, q: undefined } as never} onClick={close}>
                          <span className="text-base">{p.icon}</span>
                          <span>{p.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("sidebar.myCabinet")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userLinks.map((l) => (
                  <SidebarMenuItem key={l.to}>
                    <SidebarMenuButton asChild>
                      <Link to={l.to} onClick={close}>
                        <l.icon className="h-4 w-4" />
                        <span>{l.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {isSeller && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/seller" onClick={close}>
                        <Store className="h-4 w-4" />
                        <span>{t("sidebar.sellerPanel")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {!isSeller && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/become-seller" onClick={close}>
                      <Store className="h-4 w-4" />
                      <span>{t("sidebar.openShop")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/support" onClick={close}>
                    <HelpCircle className="h-4 w-4" />
                    <span>{t("sidebar.support")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin" onClick={close}>
                    <Shield className="h-4 w-4" />
                    <span>{t("sidebar.adminPanel")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/pvz" onClick={close}>
                    <PackageOpen className="h-4 w-4" />
                    <span>{t("sidebar.pvzPanel")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
