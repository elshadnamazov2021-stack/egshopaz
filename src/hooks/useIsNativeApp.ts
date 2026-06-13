import { useEffect, useState } from "react";

/**
 * Mobil tətbiqdə (Capacitor) işləyib-işləmədiyini müəyyən edir.
 * Veb saytda false qaytarır.
 */
export function useIsNativeApp() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Capacitor global obyekti yalnız mobil tətbiqdə mövcuddur
    const w = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } };
    if (w.Capacitor?.isNativePlatform?.()) {
      setIsNative(true);
      document.documentElement.classList.add("is-native-app");
    }
  }, []);

  return isNative;
}
