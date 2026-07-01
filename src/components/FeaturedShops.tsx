import { Link } from "@tanstack/react-router";
import { Store, MapPin } from "lucide-react";
import { shops } from "@/data/staticStore";

export function FeaturedShops() {
  return <section><div className="flex items-end justify-between mb-4"><h2 className="text-2xl md:text-3xl font-black">Seçilmiş mağazalar</h2><Link to="/shops" className="text-sm text-primary font-bold hover:underline">Hamısı →</Link></div><div className="grid sm:grid-cols-3 gap-3">{shops.map((s) => <Link key={s.id} to="/shop/$id" params={{ id: s.id }} className="bg-card border border-border rounded-2xl p-4 hover:shadow-elegant transition"><div className="w-14 h-14 rounded-2xl bg-gradient-brand text-white flex items-center justify-center mb-3"><Store className="h-7 w-7" /></div><div className="font-black">{s.shop_name}</div><div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{s.shop_city}</div><p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.shop_description}</p></Link>)}</div></section>;
}
