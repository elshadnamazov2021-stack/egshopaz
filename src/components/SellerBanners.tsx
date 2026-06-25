import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string;
  image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  seller_id: string | null;
}

function BannerCard({ b }: { b: Banner }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    void v.play().catch(() => { /* ignore autoplay block */ });
  }, []);

  const Inner = (
    <div className="relative aspect-[16/6] sm:aspect-[16/5] bg-secondary overflow-hidden">
      {b.video_url ? (
        <video
          ref={videoRef}
          src={b.video_url}
          poster={b.image_url ?? undefined}
          className="w-full h-full object-cover"
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          src={b.image_url!}
          alt={b.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

      <div className="absolute top-2 left-2 bg-warning text-warning-foreground text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-lg">
        REKLAM
      </div>

      <div className="absolute bottom-3 left-4 right-4 text-white font-black text-lg sm:text-2xl drop-shadow-lg">
        {b.title}
      </div>
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

export function SellerBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    void (async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("banners")
        .select("id,title,image_url,video_url,link_url,ends_at,seller_id,created_at")
        .eq("is_active", true)
        .eq("position", "home_top")
        .not("seller_id", "is", null)
        .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
        .order("created_at", { ascending: false })
        .limit(30);
      // One banner per seller (newest first)
      const bySeller = new Map<string, Banner>();
      for (const b of (data ?? []) as Banner[]) {
        if (!b.image_url && !b.video_url) continue;
        if (!b.seller_id) continue;
        if (!bySeller.has(b.seller_id)) bySeller.set(b.seller_id, b);
      }
      setBanners(Array.from(bySeller.values()));
    })();
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="space-y-4">
      {banners.map((b) => (
        <BannerCard key={b.id} b={b} />
      ))}
    </div>
  );
}
