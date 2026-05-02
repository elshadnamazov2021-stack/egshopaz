import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFavorite(productId: string) {
  const { user, isSeller, isPvz } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) { setIsFav(false); return; }
    let active = true;
    supabase.from("favorites").select("id").eq("user_id", user.id).eq("product_id", productId).maybeSingle()
      .then(({ data }) => { if (active) setIsFav(!!data); });
    return () => { active = false; };
  }, [user, productId]);

  const toggle = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!user) { toast.error("Sevimlilər üçün daxil olun"); return; }
    if (isSeller || isPvz) { toast.error("Sevimli yalnız müştəri hesabı üçündür"); return; }
    setBusy(true);
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
      setIsFav(false);
      toast.success("Sevimlilərdən çıxarıldı");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, product_id: productId });
      setIsFav(true);
      toast.success("Sevimlilərə əlavə olundu");
    }
    setBusy(false);
  };

  return { isFav, toggle, busy };
}
