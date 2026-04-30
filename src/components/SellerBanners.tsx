import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string | null;
}

export function SellerBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    void (async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("banners")
        .select("id,title,image_url,link_url,ends_at,seller_id")
        .eq("is_active", true)
        .eq("position", "home_top")
        .not("seller_id", "is", null)
        .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
        .limit(10);
      setBanners((data ?? []).filter((b) => b.image_url) as Banner[]);
    })();
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % banners.length);
      setAnimKey((k) => k + 1);
    }, 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const b = banners[idx];

  const Inner = (
    <div className="relative aspect-[16/6] sm:aspect-[16/5] bg-secondary overflow-hidden group">
      {/* Animated image with Ken Burns + fade */}
      <img
        key={animKey}
        src={b.image_url!}
        alt={b.title}
        className="w-full h-full object-cover animate-[bannerKenBurns_6s_ease-out_forwards] opacity-0 [animation-fill-mode:forwards] motion-reduce:animate-none motion-reduce:opacity-100"
        style={{ animation: "bannerKenBurns 6s ease-out forwards, fadeInBanner 0.7s ease-out forwards" }}
      />

      {/* Subtle gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

      {/* Animated REKLAM badge */}
      <div className="absolute top-2 left-2 bg-warning text-warning-foreground text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 animate-[badgePulse_2.4s_ease-in-out_infinite] shadow-lg">
        <Sparkles className="h-3 w-3 animate-[sparkleSpin_3s_linear_infinite]" /> REKLAM
      </div>

      {/* Title slide-in */}
      <div
        key={`t-${animKey}`}
        className="absolute bottom-8 left-4 right-4 text-white font-black text-lg sm:text-2xl drop-shadow-lg"
        style={{ animation: "slideUpFade 0.8s ease-out 0.2s both" }}
      >
        {b.title}
      </div>

      {/* Progress bar */}
      {banners.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
          <div
            key={`p-${animKey}`}
            className="h-full bg-white"
            style={{ animation: "bannerProgress 5s linear forwards" }}
          />
        </div>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i); setAnimKey((k) => k + 1); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"}`}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes bannerKenBurns {
          0% { transform: scale(1.08) translate(0, 0); }
          100% { transform: scale(1.18) translate(-1.5%, -1%); }
        }
        @keyframes fadeInBanner {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bannerProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251,191,36,0.6); }
          50% { transform: scale(1.06); box-shadow: 0 0 0 8px rgba(251,191,36,0); }
        }
        @keyframes sparkleSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return (
    <section className="rounded-3xl overflow-hidden shadow-elegant hover:shadow-2xl transition-shadow duration-500">
      {b.link_url ? (
        <a href={b.link_url} className="block">{Inner}</a>
      ) : Inner}
    </section>
  );
}
