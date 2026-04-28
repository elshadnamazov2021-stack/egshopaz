import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export type SortKey = "newest" | "price_asc" | "price_desc" | "rating" | "popular";

export interface Filters {
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  minRating?: number;
  onlyDiscount?: boolean;
  sort: SortKey;
}

const SORTS: { id: SortKey; label: string }[] = [
  { id: "newest", label: "Ən yenilər" },
  { id: "popular", label: "Populyar" },
  { id: "price_asc", label: "Ucuz əvvəl" },
  { id: "price_desc", label: "Baha əvvəl" },
  { id: "rating", label: "Reytinq" },
];

export function CatalogFilters({
  brands,
  value,
  onChange,
}: {
  brands: string[];
  value: Filters;
  onChange: (f: Filters) => void;
}) {
  const [open, setOpen] = useState(false);
  const [minP, setMinP] = useState(value.minPrice?.toString() ?? "");
  const [maxP, setMaxP] = useState(value.maxPrice?.toString() ?? "");

  useEffect(() => { setMinP(value.minPrice?.toString() ?? ""); setMaxP(value.maxPrice?.toString() ?? ""); }, [value.minPrice, value.maxPrice]);

  const apply = () => {
    onChange({
      ...value,
      minPrice: minP ? Number(minP) : undefined,
      maxPrice: maxP ? Number(maxP) : undefined,
    });
    setOpen(false);
  };

  const reset = () => {
    onChange({ sort: value.sort });
    setMinP(""); setMaxP("");
  };

  const activeCount = useMemo(() => {
    let n = 0;
    if (value.minPrice != null) n++;
    if (value.maxPrice != null) n++;
    if (value.brand) n++;
    if (value.minRating) n++;
    if (value.onlyDiscount) n++;
    return n;
  }, [value]);

  const Body = (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-bold uppercase text-muted-foreground">Qiymət (₼)</label>
        <div className="flex gap-2 mt-2">
          <input type="number" inputMode="numeric" value={minP} onChange={(e) => setMinP(e.target.value)}
                 placeholder="min" className="w-1/2 h-10 px-3 rounded-lg border border-input bg-background text-sm" />
          <input type="number" inputMode="numeric" value={maxP} onChange={(e) => setMaxP(e.target.value)}
                 placeholder="max" className="w-1/2 h-10 px-3 rounded-lg border border-input bg-background text-sm" />
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <label className="text-xs font-bold uppercase text-muted-foreground">Marka</label>
          <select value={value.brand ?? ""} onChange={(e) => onChange({ ...value, brand: e.target.value || undefined })}
                  className="mt-2 w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
            <option value="">Hamısı</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs font-bold uppercase text-muted-foreground">Min reytinq</label>
        <div className="flex gap-1 mt-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button key={r} onClick={() => onChange({ ...value, minRating: r || undefined })}
                    className={`flex-1 h-9 rounded-lg text-xs font-semibold border ${value.minRating === r || (!value.minRating && r === 0) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
              {r === 0 ? "Hamısı" : `${r}+ ★`}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={!!value.onlyDiscount} onChange={(e) => onChange({ ...value, onlyDiscount: e.target.checked || undefined })}
               className="w-4 h-4 accent-primary" />
        <span className="text-sm font-medium">Yalnız endirimli</span>
      </label>

      <div className="flex gap-2 pt-2">
        <button onClick={reset} className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold hover:bg-secondary">Sıfırla</button>
        <button onClick={apply} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90">Tətbiq et</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-3 h-10 rounded-lg border border-border bg-card hover:border-primary text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4" />
          Filtrlər
          {activeCount > 0 && <span className="ml-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">{activeCount}</span>}
        </button>

        <select value={value.sort} onChange={(e) => onChange({ ...value, sort: e.target.value as SortKey })}
                className="h-10 px-3 rounded-lg border border-border bg-card text-sm font-semibold">
          {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>

        {value.onlyDiscount && (
          <span className="inline-flex items-center gap-1 px-2.5 h-8 rounded-full bg-discount/10 text-discount text-xs font-bold">
            Endirimli <button onClick={() => onChange({ ...value, onlyDiscount: undefined })}><X className="h-3 w-3" /></button>
          </span>
        )}
        {value.brand && (
          <span className="inline-flex items-center gap-1 px-2.5 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold">
            {value.brand} <button onClick={() => onChange({ ...value, brand: undefined })}><X className="h-3 w-3" /></button>
          </span>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-card rounded-2xl shadow-elegant w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Filtrlər</h3>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {Body}
          </div>
        </div>
      )}
    </>
  );
}
