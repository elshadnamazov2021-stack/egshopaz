import { useEffect, useState } from "react";
import { X, Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";

const STORAGE_KEY = "eg_install_banner_dismissed_at";
const SHOW_AGAIN_AFTER_MS = 1000 * 60 * 60 * 24 * 7; // 7 gün

export function InstallAppBanner() {
  const isNativeApp = useIsNativeApp();
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isNativeApp) return;

    const ua = navigator.userAgent || "";
    const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    setIsMobile(mobile);
    if (!mobile) return;

    const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < SHOW_AGAIN_AFTER_MS) return;

    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, [isNativeApp]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible || !isMobile || isNativeApp) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-5">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className="shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
            <Smartphone className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm leading-tight">EG Shop tətbiqini yüklə</div>
            <div className="text-xs text-muted-foreground mt-1">
              Daha sürətli alış-veriş, bildirişlər və xüsusi endirimlər tətbiqdə.
            </div>
            <div className="mt-3 flex gap-2">
              <Button asChild size="sm" className="flex-1">
                <a href="/download">
                  <Download className="h-4 w-4 mr-1" /> Yüklə
                </a>
              </Button>
              <Button variant="ghost" size="sm" onClick={dismiss}>
                Sonra
              </Button>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Bağla"
            className="shrink-0 h-7 w-7 -mr-1 -mt-1 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
