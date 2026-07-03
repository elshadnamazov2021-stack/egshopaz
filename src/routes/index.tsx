import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header - Purple Gradient */}
      <header className="bg-gradient-to-r from-purple-600 to-violet-600 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-purple-600 font-bold text-2xl">EG</div>
            <div className="font-black text-2xl">EG Shop</div>
          </div>
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <input 
              type="text" 
              placeholder="Axtarış..." 
              className="w-full bg-white/20 text-white placeholder:text-white/70 px-6 py-3 rounded-full focus:outline-none border border-white/30"
            />
          </div>
          <div className="flex items-center gap-6 text-xl">
            ❤️ &nbsp; 🛒 &nbsp; 👤
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-3 overflow-x-auto pb-4">
          {["Elektronika", "Geyim", "Ev", "Kozmetika", "Uşaq", "İdman"].map((cat, i) => (
            <div key={i} className="bg-white shadow rounded-2xl px-6 py-3 whitespace-nowrap font-medium min-w-[120px] text-center">
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-pink-600 h-96 flex items-center justify-center text-white text-5xl font-black">
        Böyük Endirimlər Başladı!
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-8">Populyar Məhsullar</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-2xl transition">
              <div className="h-56 bg-gradient-to-br from-zinc-100 to-zinc-300 flex items-center justify-center text-6xl">
                🛍️
              </div>
              <div className="p-5">
                <div className="font-semibold">Məhsul {i}</div>
                <div className="text-purple-600 font-bold text-2xl mt-1">29.99 ₼</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
