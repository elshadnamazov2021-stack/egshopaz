import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  User as UserIcon, Heart, Package, MapPin, CreditCard, Star,
  Gift, Bell, MessageCircle, Coins, Store,
} from "lucide-react";
import type { PanelNavItem } from "@/components/PanelLayout";

export function useBuyerNav(): { items: PanelNavItem[]; bonusBalance: number } {
  const { user, isSeller } = useAuth();
  const [favCount, setFavCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("favorites").select("*", { count: "exact", head: true }).eq("user_id", user.id)
      .then(({ count }) => setFavCount(count ?? 0));
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("buyer_id", user.id).in("status", ["pending", "paid", "shipped"])
      .then(({ count }) => setOrderCount(count ?? 0));
    supabase.from("profiles").select("bonus_balance").eq("id", user.id).maybeSingle()
      .then(({ data }) => setBonusBalance((data as { bonus_balance?: number } | null)?.bonus_balance ?? 0));
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "open")
      .then(({ count }) => setOpenTickets(count ?? 0));
  }, [user]);

  const items: PanelNavItem[] = [
    { to: "/profile", label: "Profil", icon: UserIcon },
    { to: "/orders", label: "Sifarişlərim", icon: Package, badge: orderCount },
    { to: "/favorites", label: "Sevimlilər", icon: Heart, badge: favCount },
    { to: "/addresses", label: "Ünvanlarım", icon: MapPin },
    { to: "/pickup-points", label: "Çatdırış nöqtələri", icon: MapPin },
    { to: "/payment-methods", label: "Ödəniş üsulları", icon: CreditCard },
    { to: "/my-reviews", label: "Rəylərim", icon: Star },
    { to: "/promotions", label: "Aksiyalar", icon: Gift },
    { to: "/bonus", label: "Bonus xallar", icon: Coins, badge: bonusBalance },
    { to: "/notifications", label: "Bildirişlər", icon: Bell },
    { to: "/support", label: "Dəstək", icon: MessageCircle, badge: openTickets },
  ];

  return { items, bonusBalance };
}
