import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PanelLayout, type PanelNavItem } from "@/components/PanelLayout";
import { formatAZN } from "@/lib/format";
import {
  Home, PackageOpen, ShoppingBag, Undo2, Archive, BarChart3,
  Wallet, ClipboardList, Settings, LifeBuoy, ScanLine, Search,
  CheckCircle2, AlertTriangle, Printer, Camera, PhoneCall, Clock,
  Plus, XCircle, FileText, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/pvz")({
  head: () => ({ meta: [{ title: "PVZ işçi paneli — Elzan Shop" }] }),
  component: PvzPanel,
});

type TabKey =
  | "dashboard" | "intake" | "delivery" | "returns" | "storage"
  | "reports" | "finance" | "shift" | "settings" | "support";

// ---------------- MOCK DATA ----------------
const mockExpected = [
  { id: "WB-10234", buyer: "Aysel M.", items: 3, eta: "12:30", status: "Yolda" },
  { id: "WB-10235", buyer: "Rauf K.", items: 1, eta: "13:10", status: "Yolda" },
  { id: "WB-10236", buyer: "Nigar S.", items: 2, eta: "14:00", status: "Çatıb" },
];
const mockPending = [
  { id: "WB-10220", buyer: "Elvin H.", phone: "+994 50 111 22 33", days: 1, code: "4821" },
  { id: "WB-10221", buyer: "Səbinə Ə.", phone: "+994 55 222 33 44", days: 2, code: "9930" },
  { id: "WB-10222", buyer: "Tural Q.", phone: "+994 70 333 44 55", days: 5, code: "1145" },
];
const mockReturns = [
  { id: "RT-501", buyer: "Aytac R.", reason: "Ölçü uyğun deyil", state: "sağlam" },
  { id: "RT-502", buyer: "Murad B.", reason: "Zədəli", state: "zədəli" },
];
const mockStorage = [
  { id: "WB-10100", buyer: "Lalə M.", days: 8, expires: "2 gün qalıb" },
  { id: "WB-10101", buyer: "Cavid A.", days: 14, expires: "Vaxtı keçib" },
  { id: "WB-10102", buyer: "Ülviyyə N.", days: 3, expires: "7 gün qalıb" },
];

function PvzPanel() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [shiftOpen, setShiftOpen] = useState(false);
  const [scan, setScan] = useState("");
  const [search, setSearch] = useState("");

  const items: PanelNavItem[] = [
    { key: "dashboard", label: "Ana səhifə", icon: Home, active: tab === "dashboard", onClick: () => setTab("dashboard") },
    { key: "intake", label: "Qəbul", icon: PackageOpen, active: tab === "intake", onClick: () => setTab("intake"), badge: mockExpected.length },
    { key: "delivery", label: "Təhvil vermək", icon: ShoppingBag, active: tab === "delivery", onClick: () => setTab("delivery"), badge: mockPending.length },
    { key: "returns", label: "Qaytarmalar", icon: Undo2, active: tab === "returns", onClick: () => setTab("returns") },
    { key: "storage", label: "Saxlama", icon: Archive, active: tab === "storage", onClick: () => setTab("storage"), badge: 1 },
    { key: "reports", label: "Hesabatlar", icon: BarChart3, active: tab === "reports", onClick: () => setTab("reports") },
    { key: "finance", label: "Maliyyə", icon: Wallet, active: tab === "finance", onClick: () => setTab("finance") },
    { key: "shift", label: "Növbə", icon: ClipboardList, active: tab === "shift", onClick: () => setTab("shift") },
    { key: "settings", label: "Ayarlar", icon: Settings, active: tab === "settings", onClick: () => setTab("settings") },
    { key: "support", label: "Dəstək", icon: LifeBuoy, active: tab === "support", onClick: () => setTab("support") },
  ];

  return (
    <PanelLayout title="PVZ İŞÇİ PANELİ" subtitle="Bakı — N-12 nöqtə" items={items}>
      {!shiftOpen && tab !== "shift" && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4" /> Növbə bağlıdır. Əməliyyat etmək üçün növbəni açın.
          </div>
          <Button size="sm" onClick={() => { setShiftOpen(true); toast.success("Növbə açıldı"); }}>Növbəni aç</Button>
        </div>
      )}

      {tab === "dashboard" && <Dashboard />}
      {tab === "intake" && <Intake scan={scan} setScan={setScan} />}
      {tab === "delivery" && <Delivery search={search} setSearch={setSearch} />}
      {tab === "returns" && <Returns />}
      {tab === "storage" && <Storage />}
      {tab === "reports" && <Reports />}
      {tab === "finance" && <Finance />}
      {tab === "shift" && <Shift open={shiftOpen} setOpen={setShiftOpen} />}
      {tab === "settings" && <SettingsSec />}
      {tab === "support" && <Support />}
    </PanelLayout>
  );
}

// ---------------- SECTIONS ----------------
function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Icon className={`h-4 w-4 ${accent ?? "text-primary"}`} /> {label}
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2"><Home className="h-6 w-6 text-primary" /> Ana səhifə</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={PackageOpen} label="Bu gün gözlənilən" value="14" />
        <StatCard icon={ShoppingBag} label="Təhvil verilməmiş" value="23" accent="text-amber-500" />
        <StatCard icon={Undo2} label="Qaytarılacaq" value="5" accent="text-rose-500" />
        <StatCard icon={TrendingUp} label="Bugün təhvil" value="38" accent="text-emerald-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="font-bold mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Bu gün gözlənilən sifarişlər</div>
          <Table>
            <TableHeader><TableRow><TableHead>Kod</TableHead><TableHead>Müştəri</TableHead><TableHead>ETA</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {mockExpected.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono">{o.id}</TableCell>
                  <TableCell>{o.buyer}</TableCell>
                  <TableCell>{o.eta}</TableCell>
                  <TableCell><span className={o.status === "Çatıb" ? "text-emerald-600 font-semibold" : "text-amber-600"}>{o.status}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="font-bold mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Ümumi statistika (gün)</div>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between"><span>Qəbul edilən</span><b>21</b></li>
            <li className="flex justify-between"><span>Təhvil verilən</span><b>38</b></li>
            <li className="flex justify-between"><span>Qaytarılan</span><b>4</b></li>
            <li className="flex justify-between"><span>Saxlamada</span><b>62</b></li>
            <li className="flex justify-between text-emerald-600"><span>Qazanc (komissiya)</span><b>{formatAZN(48.5)}</b></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Intake({ scan, setScan }: { scan: string; setScan: (v: string) => void }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2"><PackageOpen className="h-6 w-6 text-primary" /> Qəbul</h1>

      <div className="bg-card border border-border rounded-2xl p-4">
        <Label className="mb-2 block">Ştrixkod skan</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={scan} onChange={(e) => setScan(e.target.value)} placeholder="Ştrixkodu skan edin və ya daxil edin..." className="pl-10" />
          </div>
          <Button onClick={() => { if (!scan) return; toast.success(`${scan} qəbul edildi`); setScan(""); }}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Qəbul et
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="font-bold mb-3">Anbardan gələn mallar</div>
        <Table>
          <TableHeader><TableRow><TableHead>Kod</TableHead><TableHead>Müştəri</TableHead><TableHead>Saylar</TableHead><TableHead className="text-right">Əməliyyat</TableHead></TableRow></TableHeader>
          <TableBody>
            {mockExpected.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono">{o.id}</TableCell>
                <TableCell>{o.buyer}</TableCell>
                <TableCell>{o.items}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Qəbul akti yaradıldı")}><FileText className="h-4 w-4 mr-1" /> Akt</Button>
                  <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => toast.error("Çatışmazlıq qeyd edildi")}><AlertTriangle className="h-4 w-4 mr-1" /> Problem</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Delivery({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  const filtered = mockPending.filter((o) =>
    !search || o.id.includes(search) || o.phone.includes(search) || o.code.includes(search) || o.buyer.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2"><ShoppingBag className="h-6 w-6 text-primary" /> Təhvil vermək</h1>

      <div className="bg-card border border-border rounded-2xl p-4">
        <Label className="mb-2 block">Müştəri axtarışı (kod / telefon / ad)</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="WB-... və ya +994..." className="pl-10" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="font-bold mb-3">Təhvil verilməmiş sifarişlər</div>
        <Table>
          <TableHeader><TableRow><TableHead>Kod</TableHead><TableHead>Müştəri</TableHead><TableHead>Telefon</TableHead><TableHead>SMS kod</TableHead><TableHead>Saxlama</TableHead><TableHead className="text-right">Əməliyyat</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono">{o.id}</TableCell>
                <TableCell>{o.buyer}</TableCell>
                <TableCell className="text-xs">{o.phone}</TableCell>
                <TableCell className="font-mono font-bold text-primary">{o.code}</TableCell>
                <TableCell>{o.days} gün</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => toast.success(`${o.id} təhvil verildi`)}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Təhvil ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Returns() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2"><Undo2 className="h-6 w-6 text-primary" /> Qaytarmalar</h1>
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="font-bold mb-3">Qəbul olunmuş qaytarmalar</div>
        <Table>
          <TableHeader><TableRow><TableHead>Kod</TableHead><TableHead>Müştəri</TableHead><TableHead>Səbəb</TableHead><TableHead>Vəziyyət</TableHead><TableHead className="text-right">Əməliyyat</TableHead></TableRow></TableHeader>
          <TableBody>
            {mockReturns.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono">{r.id}</TableCell>
                <TableCell>{r.buyer}</TableCell>
                <TableCell>{r.reason}</TableCell>
                <TableCell><span className={r.state === "zədəli" ? "text-rose-600 font-semibold" : "text-emerald-600"}>{r.state}</span></TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Geri göndəriş üçün qablaşdırıldı")}>Qablaşdır</Button>
                  <Button size="sm" onClick={() => toast.success("Qaytarma akti yaradıldı")}><FileText className="h-4 w-4 mr-1" /> Akt</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="outline" className="mt-3"><Plus className="h-4 w-4 mr-1" /> Yeni qaytarma qəbul et</Button>
      </div>
    </div>
  );
}

function Storage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2"><Archive className="h-6 w-6 text-primary" /> Saxlama</h1>
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Archive} label="Cəmi saxlamada" value="62" />
        <StatCard icon={Clock} label="Müddəti azalan" value="7" accent="text-amber-500" />
        <StatCard icon={AlertTriangle} label="Müddəti keçmiş" value="2" accent="text-rose-500" />
      </div>
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="font-bold mb-3">Saxlamadakı mallar</div>
        <Table>
          <TableHeader><TableRow><TableHead>Kod</TableHead><TableHead>Müştəri</TableHead><TableHead>Saxlanma</TableHead><TableHead>Vəziyyət</TableHead><TableHead className="text-right">Əməliyyat</TableHead></TableRow></TableHeader>
          <TableBody>
            {mockStorage.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono">{s.id}</TableCell>
                <TableCell>{s.buyer}</TableCell>
                <TableCell>{s.days} gün</TableCell>
                <TableCell><span className={s.expires.includes("keçib") ? "text-rose-600 font-semibold" : "text-amber-600"}>{s.expires}</span></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Müştəriyə xəbərdarlıq göndərildi")}><PhoneCall className="h-4 w-4 mr-1" /> Bildiriş</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Reports() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary" /> Hesabatlar</h1>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="font-bold mb-3">Günlük statistika</div>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between"><span>Qəbul</span><b>21</b></li>
            <li className="flex justify-between"><span>Təhvil</span><b>38</b></li>
            <li className="flex justify-between"><span>Qaytarma</span><b>4</b></li>
            <li className="flex justify-between"><span>Konversiya</span><b>92%</b></li>
          </ul>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="font-bold mb-3">İşçi performansı</div>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between"><span>Orta təhvil müddəti</span><b>2 dəq</b></li>
            <li className="flex justify-between"><span>Müştəri reytinqi</span><b>4.8 / 5</b></li>
            <li className="flex justify-between"><span>Səhv əməliyyatlar</span><b>0</b></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Finance() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2"><Wallet className="h-6 w-6 text-primary" /> Maliyyə</h1>
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={TrendingUp} label="Bu gün qazanc" value={formatAZN(48.5)} accent="text-emerald-500" />
        <StatCard icon={Wallet} label="Bu ay qazanc" value={formatAZN(1240)} />
        <StatCard icon={ClipboardList} label="Əməliyyat (gün)" value="63" />
      </div>
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="font-bold mb-3">Ödəniş tarixçəsi</div>
        <Table>
          <TableHeader><TableRow><TableHead>Tarix</TableHead><TableHead>Növ</TableHead><TableHead className="text-right">Məbləğ</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell>25.04.2026</TableCell><TableCell>Həftəlik ödəniş</TableCell><TableCell className="text-right font-bold text-emerald-600">{formatAZN(312)}</TableCell></TableRow>
            <TableRow><TableCell>18.04.2026</TableCell><TableCell>Həftəlik ödəniş</TableCell><TableCell className="text-right font-bold text-emerald-600">{formatAZN(298)}</TableCell></TableRow>
            <TableRow><TableCell>11.04.2026</TableCell><TableCell>Həftəlik ödəniş</TableCell><TableCell className="text-right font-bold text-emerald-600">{formatAZN(341)}</TableCell></TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Shift({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2"><ClipboardList className="h-6 w-6 text-primary" /> Növbə</h1>
      <div className="bg-card border border-border rounded-2xl p-6 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${open ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
          {open ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {open ? "Növbə AÇIQDIR" : "Növbə BAĞLIDIR"}
        </div>
        <div className="flex justify-center gap-2">
          {!open ? (
            <Button onClick={() => { setOpen(true); toast.success("Növbə açıldı — 09:00"); }}>Növbəni aç</Button>
          ) : (
            <Button variant="destructive" onClick={() => { setOpen(false); toast.success("Növbə bağlandı, kassa hesabatı çap edildi"); }}>Növbəni bağla</Button>
          )}
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="font-bold mb-3">Kassa / Gün sonu balansı</div>
        <ul className="text-sm space-y-2">
          <li className="flex justify-between"><span>Açılış balansı</span><b>{formatAZN(0)}</b></li>
          <li className="flex justify-between"><span>Nağd qəbul</span><b>{formatAZN(420)}</b></li>
          <li className="flex justify-between"><span>Qaytarma (nağd)</span><b className="text-rose-600">- {formatAZN(35)}</b></li>
          <li className="flex justify-between border-t pt-2 mt-2"><span className="font-bold">Cari balans</span><b className="text-emerald-600">{formatAZN(385)}</b></li>
        </ul>
      </div>
    </div>
  );
}

function SettingsSec() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2"><Settings className="h-6 w-6 text-primary" /> Ayarlar</h1>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="font-bold flex items-center gap-2"><Clock className="h-4 w-4" /> İş saatları</div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Açılış</Label><Input defaultValue="09:00" /></div>
            <div><Label>Bağlanış</Label><Input defaultValue="21:00" /></div>
          </div>
          <Button size="sm" onClick={() => toast.success("İş saatları yadda saxlandı")}>Yadda saxla</Button>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="font-bold flex items-center gap-2"><Printer className="h-4 w-4" /> Printer ayarları</div>
          <div><Label>Etiket printeri</Label><Input defaultValue="Zebra ZD220" /></div>
          <Button size="sm" variant="outline" onClick={() => toast.success("Test etiketi çap edildi")}>Test çap</Button>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="font-bold flex items-center gap-2"><Camera className="h-4 w-4" /> Skaner / Kamera</div>
          <div><Label>Skaner cihazı</Label><Input defaultValue="USB Honeywell" /></div>
          <Button size="sm" variant="outline" onClick={() => toast.success("Skaner aktiv")}>Skaneri yoxla</Button>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="font-bold">İşçilərin girişi</div>
          <ul className="text-sm space-y-1">
            <li className="flex justify-between"><span>Aytən H. (operator)</span><span className="text-emerald-600">aktiv</span></li>
            <li className="flex justify-between"><span>Rəşad M. (operator)</span><span className="text-muted-foreground">offline</span></li>
          </ul>
          <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> İşçi əlavə et</Button>
        </div>
      </div>
    </div>
  );
}

function Support() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2"><LifeBuoy className="h-6 w-6 text-primary" /> Dəstək</h1>
      <div className="grid lg:grid-cols-3 gap-3">
        <button className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary transition" onClick={() => toast.success("Texniki dəstəyə bağlanılır...")}>
          <PhoneCall className="h-6 w-6 text-primary mb-2" />
          <div className="font-bold">Texniki dəstək</div>
          <div className="text-xs text-muted-foreground">7/24 əlaqə xətti</div>
        </button>
        <button className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary transition" onClick={() => toast.success("Problem qeydiyyata alındı")}>
          <AlertTriangle className="h-6 w-6 text-amber-500 mb-2" />
          <div className="font-bold">Problem bildir</div>
          <div className="text-xs text-muted-foreground">Sistem / əməliyyat xətası</div>
        </button>
        <button className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary transition" onClick={() => toast.success("Şikayət göndərildi")}>
          <Undo2 className="h-6 w-6 text-rose-500 mb-2" />
          <div className="font-bold">Zədəli mal şikayəti</div>
          <div className="text-xs text-muted-foreground">Foto ilə birlikdə</div>
        </button>
      </div>
    </div>
  );
}
