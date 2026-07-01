import { Link } from "@tanstack/react-router";
import { shops } from "@/data/staticStore";

export function SellerBanners() {
  return <section className="grid md:grid-cols-3 gap-3">{shops.map((s, i) => <Link key={s.id} to="/shop/$id" params={{ id: s.id }} className={`rounded-3xl p-5 min-h-36 text-white overflow-hidden relative shadow-card bg-gradient-to-br ${i === 0 ? "from-fuchsia-600 to-violet-700" : i === 1 ? "from-blue-600 to-cyan-600" : "from-emerald-600 to-teal-700"}`}><div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-white/20 blur-2xl" /><div className="relative z-10"><div className="text-xs uppercase font-bold opacity-80">Satıcı banneri</div><h2 className="text-2xl font-black mt-1">{s.shop_name}</h2><p className="text-sm opacity-90 mt-2 line-clamp-2">{s.shop_description}</p></div></Link>)}</section>;
}
