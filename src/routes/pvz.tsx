import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRScannerDialog } from "@/components/QRScannerDialog";
import { PvzOrderChat } from "@/components/PvzOrderChat";
import { AISupportChat } from "@/components/AISupportChat";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { PanelLayout, type PanelNavItem } from "@/components/PanelLayout";
import { formatAZN } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import {
  Home,
  PackageOpen,
  ShoppingBag,
  Undo2,
  Archive,
  BarChart3,
  Wallet,
  ClipboardList,
  Settings,
  LifeBuoy,
  ScanLine,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Camera,
  PhoneCall,
  Clock,
  Plus,
  XCircle,
  FileText,
  TrendingUp,
  Bell,
  MessageCircle,
  UserCircle2,
  KeyRound,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/pvz")({
  head: () => ({ meta: [{ title: "PVZ işçi paneli — Elzan Shop" }] }),
  component: PvzPanel,
});

type TabKey =
  | "dashboard"
  | "intake"
  | "delivery"
  | "returns"
  | "storage"
  | "reports"
  | "finance"
  | "shift"
  | "messages"
  | "account"
  | "settings"
  | "support";

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
  const { t } = useTranslation();
  const { user, isPvz, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [shiftOpen, setShiftOpen] = useState(false);
  const [scan, setScan] = useState("");
  const [search, setSearch] = useState("");
  const [pvzUnread, setPvzUnread] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
    if (!authLoading && user && !isPvz) navigate({ to: "/" });
  }, [user, isPvz, authLoading, navigate]);

  useEffect(() => {
    if (!user || !isPvz) return;
    const refreshUnread = () => {
      supabase
        .from("pvz_notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false)
        .then(({ count }) => setPvzUnread(count ?? 0));
    };
    refreshUnread();
    const ch = supabase
      .channel(`pvz-unread-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pvz_notifications" },
        refreshUnread,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, isPvz]);

  if (!user || !isPvz) return null;

  const items: PanelNavItem[] = [
    {
      key: "dashboard",
      label: t("pvz.dashboard"),
      icon: Home,
      active: tab === "dashboard",
      onClick: () => setTab("dashboard"),
    },
    {
      key: "notifications",
      label: "Bildirişlər",
      icon: Bell,
      badge: pvzUnread,
      active: tab === "dashboard",
      onClick: () => setTab("dashboard"),
    },
    {
      key: "intake",
      label: t("pvz.intake"),
      icon: PackageOpen,
      active: tab === "intake",
      onClick: () => setTab("intake"),
      badge: mockExpected.length,
    },
    {
      key: "delivery",
      label: t("pvz.delivery"),
      icon: ShoppingBag,
      active: tab === "delivery",
      onClick: () => setTab("delivery"),
      badge: mockPending.length,
    },
    {
      key: "returns",
      label: t("pvz.returns"),
      icon: Undo2,
      active: tab === "returns",
      onClick: () => setTab("returns"),
    },
    {
      key: "storage",
      label: t("pvz.storage"),
      icon: Archive,
      active: tab === "storage",
      onClick: () => setTab("storage"),
      badge: 1,
    },
    {
      key: "reports",
      label: t("pvz.reports"),
      icon: BarChart3,
      active: tab === "reports",
      onClick: () => setTab("reports"),
    },
    {
      key: "finance",
      label: t("pvz.finance"),
      icon: Wallet,
      active: tab === "finance",
      onClick: () => setTab("finance"),
    },
    {
      key: "shift",
      label: t("pvz.shift"),
      icon: ClipboardList,
      active: tab === "shift",
      onClick: () => setTab("shift"),
    },
    {
      key: "messages",
      label: "Müştəri mesajları",
      icon: MessageCircle,
      active: tab === "messages",
      onClick: () => setTab("messages"),
    },
    {
      key: "account",
      label: "Şəxsi hesab",
      icon: UserCircle2,
      active: tab === "account",
      onClick: () => setTab("account"),
    },
    {
      key: "settings",
      label: t("pvz.settings"),
      icon: Settings,
      active: tab === "settings",
      onClick: () => setTab("settings"),
    },
    {
      key: "support",
      label: t("pvz.support"),
      icon: LifeBuoy,
      active: tab === "support",
      onClick: () => setTab("support"),
    },
  ];

  return (
    <PanelLayout title={t("pvz.title")} subtitle="PVZ PUNKT işçi paneli" items={items}>
      {!shiftOpen && tab !== "shift" && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4" /> Növbə bağlıdır. Əməliyyat etmək üçün növbəni açın.
          </div>
          <Button
            size="sm"
            onClick={() => {
              setShiftOpen(true);
              toast.success("Növbə açıldı");
            }}
          >
            Növbəni aç
          </Button>
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
      {tab === "messages" && <PvzMessagesTab />}
      {tab === "account" && <AccountSec />}
      {tab === "settings" && <SettingsSec />}
      {tab === "support" && <Support />}
    </PanelLayout>
  );
}

// ---------------- SECTIONS ----------------
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Icon className={`h-4 w-4 ${accent ?? "text-primary"}`} /> {label}
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  );
}

interface PvzNotif {
  id: string;
  title: string;
  body: string;
  type: string;
  pickup_code: string | null;
  is_read: boolean;
  created_at: string;
}

function Dashboard() {
  const [notifs, setNotifs] = useState<PvzNotif[]>([]);
  const unread = notifs.filter((n) => !n.is_read).length;

  const load = () => {
    supabase
      .from("pvz_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(15)
      .then(({ data }) => setNotifs((data ?? []) as PvzNotif[]));
  };
  useEffect(() => {
    load();
    const ch = supabase
      .channel("pvz-dash-notif")
      .on("postgres_changes", { event: "*", schema: "public", table: "pvz_notifications" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const markAll = async () => {
    await supabase.from("pvz_notifications").update({ is_read: true }).eq("is_read", false);
    toast.success("Hamısı oxundu");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <Home className="h-6 w-6 text-primary" /> Ana səhifə
      </h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Bell}
          label="Yeni bildiriş"
          value={String(unread)}
          accent={unread > 0 ? "text-rose-500" : "text-primary"}
        />
        <StatCard icon={ShoppingBag} label="Təhvil verilməmiş" value="23" accent="text-amber-500" />
        <StatCard icon={Undo2} label="Qaytarılacaq" value="5" accent="text-rose-500" />
        <StatCard icon={TrendingUp} label="Bugün təhvil" value="38" accent="text-emerald-500" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="font-bold mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> PVZ bildirişləri
          </span>
          {unread > 0 && (
            <Button size="sm" variant="ghost" onClick={markAll}>
              Hamısı oxundu
            </Button>
          )}
        </div>
        {notifs.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">Hələ bildiriş yoxdur</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifs.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border ${!n.is_read ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
              >
                <div className="flex items-start gap-2">
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{n.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
                    {n.pickup_code && (
                      <div className="mt-1.5 inline-block font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                        Kod: {n.pickup_code}
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleString("az-AZ")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DBOrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  pickup_code: string;
  status: string;
  accepted_at: string | null;
  delivered_at: string | null;
  pickup_point_id: string | null;
  order_id: string;
  orders?: {
    id: string;
    recipient_name: string | null;
    recipient_phone: string | null;
    pickup_point_id: string | null;
  } | null;
}

type OrderInfo = {
  id: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  pickup_point_id: string | null;
};

async function attachOrderInfo(rows: DBOrderItem[]): Promise<DBOrderItem[]> {
  const ids = [...new Set(rows.map((row) => row.order_id).filter(Boolean))];
  const { data } = ids.length
    ? await supabase
        .from("orders")
        .select("id,recipient_name,recipient_phone,pickup_point_id")
        .in("id", ids)
    : { data: [] };
  const map = new Map((data ?? []).map((order) => [order.id, order as OrderInfo]));
  return rows.map((row) => ({ ...row, orders: map.get(row.order_id) ?? null }));
}

async function findItemByCode(code: string): Promise<DBOrderItem | null> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;
  const { data, error } = await supabase
    .from("order_items")
    .select(
      "id,title,price,quantity,pickup_code,status,accepted_at,delivered_at,pickup_point_id,order_id",
    )
    .eq("pickup_code", trimmed)
    .maybeSingle();
  if (error) {
    toast.error(error.message);
    return null;
  }
  if (!data) return null;
  const [item] = await attachOrderInfo([data as DBOrderItem]);
  return item;
}

function Intake({ scan, setScan }: { scan: string; setScan: (v: string) => void }) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [pending, setPending] = useState<DBOrderItem[]>([]);
  const [busy, setBusy] = useState(false);

  const load = () => {
    supabase
      .from("order_items")
      .select(
        "id,title,price,quantity,pickup_code,status,accepted_at,delivered_at,pickup_point_id,order_id",
      )
      .in("status", ["packed", "shipped"])
      .is("accepted_at", null)
      .order("id", { ascending: false })
      .limit(50)
      .then(async ({ data }) => setPending(await attachOrderInfo((data ?? []) as DBOrderItem[])));
  };
  useEffect(() => {
    load();
    const ch = supabase
      .channel("pvz-intake-items")
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const acceptByCode = async (code: string) => {
    setBusy(true);
    const item = await findItemByCode(code);
    if (!item) {
      toast.error("Bu kod tapılmadı");
      setBusy(false);
      return;
    }
    if (item.accepted_at) {
      toast.info("Bu məhsul artıq qəbul edilib");
      setBusy(false);
      return;
    }
    const pvzId = item.orders?.pickup_point_id ?? item.pickup_point_id;
    const { error } = await supabase
      .from("order_items")
      .update({ status: "shipped", accepted_at: new Date().toISOString(), pickup_point_id: pvzId })
      .eq("id", item.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`✓ ${item.title.slice(0, 30)} qəbul edildi`);
    setScan("");
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <PackageOpen className="h-6 w-6 text-primary" /> Qəbul
      </h1>

      <div className="bg-card border border-border rounded-2xl p-4">
        <Label className="mb-2 block">Satıcı paketinin QR / pickup kodu</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={scan}
              onChange={(e) => setScan(e.target.value.toUpperCase())}
              placeholder="Pickup kodu daxil edin..."
              className="pl-10 font-mono uppercase"
              onKeyDown={(e) => e.key === "Enter" && scan && acceptByCode(scan)}
            />
          </div>
          <Button variant="outline" onClick={() => setScannerOpen(true)}>
            <Camera className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Kamera</span>
          </Button>
          <Button disabled={busy || !scan} onClick={() => acceptByCode(scan)}>
            <CheckCircle2 className="h-4 w-4 sm:mr-1" />{" "}
            <span className="hidden sm:inline">Qəbul et</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          📱 Telefon kamerası ilə paketin üzərindəki QR-ı oxuyun — sistem avtomatik tapıb qəbul
          edəcək
        </p>
      </div>

      <QRScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        title="Paket QR skan"
        onScan={(value) => {
          setScan(value);
          acceptByCode(value);
        }}
      />

      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="font-bold mb-3 flex items-center justify-between">
          <span>Gözləyən paketlər ({pending.length})</span>
          <Button size="sm" variant="ghost" onClick={load}>
            Yenilə
          </Button>
        </div>
        {pending.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            Hazırda gözləyən paket yoxdur
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pickup kodu</TableHead>
                <TableHead>Məhsul</TableHead>
                <TableHead>Müştəri</TableHead>
                <TableHead className="text-right">Əməliyyat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono font-bold text-primary">
                    {o.pickup_code}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{o.title}</TableCell>
                  <TableCell className="text-xs">{o.orders?.recipient_name ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" disabled={busy} onClick={() => acceptByCode(o.pickup_code)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Qəbul et
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function Delivery({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [list, setList] = useState<DBOrderItem[]>([]);
  const [busy, setBusy] = useState(false);

  const load = () => {
    supabase
      .from("order_items")
      .select(
        "id,title,price,quantity,pickup_code,status,accepted_at,delivered_at,pickup_point_id,order_id",
      )
      .not("accepted_at", "is", null)
      .is("delivered_at", null)
      .order("accepted_at", { ascending: true })
      .limit(100)
      .then(async ({ data }) => setList(await attachOrderInfo((data ?? []) as DBOrderItem[])));
  };
  useEffect(() => {
    load();
    const ch = supabase
      .channel("pvz-delivery-items")
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const deliverByCode = async (code: string) => {
    setBusy(true);
    const q = code.trim();
    const fromList = list.find(
      (o) => o.pickup_code === q.toUpperCase() || o.orders?.recipient_phone?.includes(q),
    );
    const item = fromList ?? (await findItemByCode(code));
    if (!item) {
      toast.error("Bu kod tapılmadı");
      setBusy(false);
      return;
    }
    if (!item.accepted_at) {
      toast.error("Bu məhsul hələ PVZ-yə qəbul edilməyib");
      setBusy(false);
      return;
    }
    if (item.delivered_at) {
      toast.info("Artıq təhvil verilib");
      setBusy(false);
      return;
    }
    const { error } = await supabase
      .from("order_items")
      .update({ status: "delivered", delivered_at: new Date().toISOString() })
      .eq("id", item.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`✓ ${item.title.slice(0, 30)} müştəriyə təhvil verildi`);
    setSearch("");
    load();
  };

  const filtered = list.filter(
    (o) =>
      !search ||
      o.pickup_code.includes(search.toUpperCase()) ||
      (o.orders?.recipient_phone ?? "").includes(search) ||
      (o.orders?.recipient_name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <ShoppingBag className="h-6 w-6 text-primary" /> Təhvil vermək
      </h1>

      <div className="bg-card border border-border rounded-2xl p-4">
        <Label className="mb-2 block">Müştəri QR kodu / pickup kodu / telefon</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pickup kodu və ya telefon..."
              className="pl-10"
              onKeyDown={(e) => e.key === "Enter" && search && deliverByCode(search)}
            />
          </div>
          <Button variant="outline" onClick={() => setScannerOpen(true)}>
            <Camera className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Skan</span>
          </Button>
          <Button disabled={busy || !search} onClick={() => deliverByCode(search)}>
            <CheckCircle2 className="h-4 w-4 sm:mr-1" />{" "}
            <span className="hidden sm:inline">Təhvil ver</span>
          </Button>
        </div>
      </div>

      <QRScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        title="Müştəri QR skan"
        onScan={(value) => {
          setSearch(value);
          deliverByCode(value);
        }}
      />

      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="font-bold mb-3 flex items-center justify-between">
          <span>PVZ-də gözləyən sifarişlər ({filtered.length})</span>
          <Button size="sm" variant="ghost" onClick={load}>
            Yenilə
          </Button>
        </div>
        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            Təhvil veriləcək məhsul yoxdur
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pickup kodu</TableHead>
                <TableHead>Məhsul</TableHead>
                <TableHead>Müştəri</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead className="text-right">Əməliyyat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono font-bold text-primary">
                    {o.pickup_code}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{o.title}</TableCell>
                  <TableCell className="text-xs">{o.orders?.recipient_name ?? "—"}</TableCell>
                  <TableCell className="text-xs">{o.orders?.recipient_phone ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" disabled={busy} onClick={() => deliverByCode(o.pickup_code)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Təhvil ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function Returns() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <Undo2 className="h-6 w-6 text-primary" /> Qaytarmalar
      </h1>
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="font-bold mb-3">Qəbul olunmuş qaytarmalar</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kod</TableHead>
              <TableHead>Müştəri</TableHead>
              <TableHead>Səbəb</TableHead>
              <TableHead>Vəziyyət</TableHead>
              <TableHead className="text-right">Əməliyyat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReturns.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono">{r.id}</TableCell>
                <TableCell>{r.buyer}</TableCell>
                <TableCell>{r.reason}</TableCell>
                <TableCell>
                  <span
                    className={
                      r.state === "zədəli" ? "text-rose-600 font-semibold" : "text-emerald-600"
                    }
                  >
                    {r.state}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success("Geri göndəriş üçün qablaşdırıldı")}
                  >
                    Qablaşdır
                  </Button>
                  <Button size="sm" onClick={() => toast.success("Qaytarma akti yaradıldı")}>
                    <FileText className="h-4 w-4 mr-1" /> Akt
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="outline" className="mt-3">
          <Plus className="h-4 w-4 mr-1" /> Yeni qaytarma qəbul et
        </Button>
      </div>
    </div>
  );
}

function Storage() {
  const [list, setList] = useState<DBOrderItem[]>([]);
  useEffect(() => {
    supabase
      .from("order_items")
      .select(
        "id,title,price,quantity,pickup_code,status,accepted_at,delivered_at,pickup_point_id,order_id",
      )
      .not("accepted_at", "is", null)
      .is("delivered_at", null)
      .order("accepted_at", { ascending: true })
      .limit(100)
      .then(async ({ data }) => setList(await attachOrderInfo((data ?? []) as DBOrderItem[])));
  }, []);
  const now = Date.now();
  const days = (a: string | null) => (a ? Math.floor((now - new Date(a).getTime()) / 86400000) : 0);
  const expiring = list.filter((s) => days(s.accepted_at) >= 5 && days(s.accepted_at) < 7).length;
  const expired = list.filter((s) => days(s.accepted_at) >= 7).length;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <Archive className="h-6 w-6 text-primary" /> Saxlama
      </h1>
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Archive} label="Cəmi saxlamada" value={String(list.length)} />
        <StatCard
          icon={Clock}
          label="Müddəti azalan"
          value={String(expiring)}
          accent="text-amber-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Müddəti keçmiş"
          value={String(expired)}
          accent="text-rose-500"
        />
      </div>
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="font-bold mb-3">Saxlamadakı mallar ({list.length})</div>
        {list.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            Saxlamada məhsul yoxdur
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kod</TableHead>
                <TableHead>Müştəri</TableHead>
                <TableHead>Saxlanma</TableHead>
                <TableHead>Vəziyyət</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((s) => {
                const d = days(s.accepted_at);
                const lbl = d >= 7 ? "Vaxtı keçib" : d >= 5 ? `${7 - d} gün qalıb` : `${d} gün`;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono">{s.pickup_code}</TableCell>
                    <TableCell>{s.orders?.recipient_name ?? "—"}</TableCell>
                    <TableCell>{d} gün</TableCell>
                    <TableCell>
                      <span
                        className={
                          d >= 7
                            ? "text-rose-600 font-semibold"
                            : d >= 5
                              ? "text-amber-600"
                              : "text-muted-foreground"
                        }
                      >
                        {lbl}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function Reports() {
  const [stats, setStats] = useState({ accepted: 0, delivered: 0, total: 0 });
  useEffect(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    Promise.all([
      supabase
        .from("order_items")
        .select("*", { count: "exact", head: true })
        .gte("accepted_at", start.toISOString()),
      supabase
        .from("order_items")
        .select("*", { count: "exact", head: true })
        .gte("delivered_at", start.toISOString()),
      supabase.from("order_items").select("*", { count: "exact", head: true }),
    ]).then(([a, d, t]) =>
      setStats({ accepted: a.count ?? 0, delivered: d.count ?? 0, total: t.count ?? 0 }),
    );
  }, []);
  const conv = stats.accepted > 0 ? Math.round((stats.delivered / stats.accepted) * 100) : 0;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" /> Hesabatlar
      </h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={PackageOpen}
          label="Bugün qəbul"
          value={String(stats.accepted)}
          accent="text-primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Bugün təhvil"
          value={String(stats.delivered)}
          accent="text-emerald-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Konversiya"
          value={`${conv}%`}
          accent="text-emerald-500"
        />
        <StatCard icon={Archive} label="Ümumi sifariş" value={String(stats.total)} />
      </div>
    </div>
  );
}

function Finance() {
  const [today, setToday] = useState(0);
  const [month, setMonth] = useState(0);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const startD = new Date();
    startD.setHours(0, 0, 0, 0);
    const startM = new Date();
    startM.setDate(1);
    startM.setHours(0, 0, 0, 0);
    Promise.all([
      supabase
        .from("order_items")
        .select("price,quantity")
        .gte("delivered_at", startD.toISOString()),
      supabase
        .from("order_items")
        .select("price,quantity")
        .gte("delivered_at", startM.toISOString()),
    ]).then(([d, m]) => {
      const sumD = (d.data ?? []).reduce(
        (s: number, r: { price: number; quantity: number }) =>
          s + Number(r.price) * r.quantity * 0.05,
        0,
      );
      const sumM = (m.data ?? []).reduce(
        (s: number, r: { price: number; quantity: number }) =>
          s + Number(r.price) * r.quantity * 0.05,
        0,
      );
      setToday(sumD);
      setMonth(sumM);
      setCount((d.data ?? []).length);
    });
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <Wallet className="h-6 w-6 text-primary" /> Maliyyə
      </h1>
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={TrendingUp}
          label="Bu gün qazanc (5%)"
          value={formatAZN(today)}
          accent="text-emerald-500"
        />
        <StatCard icon={Wallet} label="Bu ay qazanc" value={formatAZN(month)} />
        <StatCard icon={ClipboardList} label="Bugün təhvil" value={String(count)} />
      </div>
      <p className="text-xs text-muted-foreground">PVZ payı: hər təhvil verilmiş məhsulun 5%-i</p>
    </div>
  );
}

function Shift({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <ClipboardList className="h-6 w-6 text-primary" /> Növbə
      </h1>
      <div className="bg-card border border-border rounded-2xl p-6 text-center">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${open ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
        >
          {open ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {open ? "Növbə AÇIQDIR" : "Növbə BAĞLIDIR"}
        </div>
        <div className="flex justify-center gap-2">
          {!open ? (
            <Button
              onClick={() => {
                setOpen(true);
                toast.success("Növbə açıldı — 09:00");
              }}
            >
              Növbəni aç
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => {
                setOpen(false);
                toast.success("Növbə bağlandı, kassa hesabatı çap edildi");
              }}
            >
              Növbəni bağla
            </Button>
          )}
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="font-bold mb-3">Kassa / Gün sonu balansı</div>
        <ul className="text-sm space-y-2">
          <li className="flex justify-between">
            <span>Açılış balansı</span>
            <b>{formatAZN(0)}</b>
          </li>
          <li className="flex justify-between">
            <span>Nağd qəbul</span>
            <b>{formatAZN(420)}</b>
          </li>
          <li className="flex justify-between">
            <span>Qaytarma (nağd)</span>
            <b className="text-rose-600">- {formatAZN(35)}</b>
          </li>
          <li className="flex justify-between border-t pt-2 mt-2">
            <span className="font-bold">Cari balans</span>
            <b className="text-emerald-600">{formatAZN(385)}</b>
          </li>
        </ul>
      </div>
    </div>
  );
}

function AccountSec() {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("operator");
  const [pvzName, setPvzName] = useState("");
  const [pvzCity, setPvzCity] = useState("");
  const [pvzAddress, setPvzAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name,phone")
        .eq("id", user.id)
        .maybeSingle();
      setFullName(prof?.full_name ?? "");
      setPhone(prof?.phone ?? "");

      // Reliable lookup only by user_id so another phone-matched PVZ address never appears
      const staff = (
        await supabase
          .from("pvz_staff")
          .select("position,pickup_point_id")
          .eq("user_id", user.id)
          .maybeSingle()
      ).data;
      if (staff?.position) setPosition(staff.position);
      if (staff?.pickup_point_id) {
        const { data: pp } = await supabase
          .from("pickup_points")
          .select("name,city,address")
          .eq("id", staff.pickup_point_id)
          .maybeSingle();
        setPvzName(pp?.name ?? "");
        setPvzCity(pp?.city ?? "");
        setPvzAddress(pp?.address ?? "");
      }
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: fullName.trim().slice(0, 100),
        phone: phone.trim().slice(0, 30),
      },
      { onConflict: "id" },
    );
    setSaving(false);
    if (error) toast.error("Yadda saxlanmadı");
    else toast.success("Şəxsi məlumatlar yeniləndi");
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Şifrə minimum 6 simvol olmalıdır");
      return;
    }
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Şifrə yeniləndi");
      setNewPassword("");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <UserCircle2 className="h-6 w-6 text-primary" /> PVZ PUNKT işçisinin şəxsi hesabı
      </h1>
      <p className="text-sm text-muted-foreground">
        Qeydiyyatda hansı PVZ PUNKT ünvanı yazılıbsa, burada həmin ünvan göstərilir.
      </p>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="font-bold flex items-center gap-2">
            <UserCircle2 className="h-4 w-4" /> Şəxsi məlumatlar
          </div>
          <div>
            <Label>E-poçt</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div>
            <Label>Tam ad (Soyad Ad)</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+994..." />
          </div>
          <div>
            <Label>Vəzifə</Label>
            <Input value={position} disabled />
          </div>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "..." : "Yadda saxla"}
          </Button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="font-bold flex items-center gap-2">
            <Home className="h-4 w-4" /> İşlədiyi PVZ PUNKT
          </div>
          <div>
            <Label>PVZ PUNKT adı</Label>
            <Input value={pvzName} disabled />
          </div>
          <div>
            <Label>Şəhər</Label>
            <Input value={pvzCity} disabled />
          </div>
          <div>
            <Label>Ünvan</Label>
            <Input value={pvzAddress} disabled />
          </div>
          <p className="text-xs text-muted-foreground">
            PVZ PUNKT məlumatlarını dəyişmək üçün admin ilə əlaqə saxlayın.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="font-bold flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Şifrəni dəyiş
          </div>
          <div>
            <Label>Yeni şifrə (min 6 simvol)</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <Button size="sm" variant="outline" onClick={changePassword} disabled={pwBusy}>
            {pwBusy ? "..." : "Şifrəni yenilə"}
          </Button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="font-bold flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Hesabdan çıxış
          </div>
          <p className="text-sm text-muted-foreground">Növbəni bağladıqdan sonra çıxış edin.</p>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              await signOut();
              toast.success("Çıxış edildi");
            }}
          >
            Çıxış et
          </Button>
        </div>
      </div>
    </div>
  );
}

function SettingsSec() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" /> Ayarlar
      </h1>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="font-bold flex items-center gap-2">
            <Clock className="h-4 w-4" /> İş saatları
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Açılış</Label>
              <Input defaultValue="09:00" />
            </div>
            <div>
              <Label>Bağlanış</Label>
              <Input defaultValue="21:00" />
            </div>
          </div>
          <Button size="sm" onClick={() => toast.success("İş saatları yadda saxlandı")}>
            Yadda saxla
          </Button>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="font-bold flex items-center gap-2">
            <Printer className="h-4 w-4" /> Printer ayarları
          </div>
          <div>
            <Label>Etiket printeri</Label>
            <Input defaultValue="Zebra ZD220" />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success("Test etiketi çap edildi")}
          >
            Test çap
          </Button>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="font-bold flex items-center gap-2">
            <Camera className="h-4 w-4" /> Skaner / Kamera
          </div>
          <div>
            <Label>Skaner cihazı</Label>
            <Input defaultValue="USB Honeywell" />
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success("Skaner aktiv")}>
            Skaneri yoxla
          </Button>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="font-bold">İşçilərin girişi</div>
          <ul className="text-sm space-y-1">
            <li className="flex justify-between">
              <span>Aytən H. (operator)</span>
              <span className="text-emerald-600">aktiv</span>
            </li>
            <li className="flex justify-between">
              <span>Rəşad M. (operator)</span>
              <span className="text-muted-foreground">offline</span>
            </li>
          </ul>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" /> İşçi əlavə et
          </Button>
        </div>
      </div>
    </div>
  );
}

function Support() {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <LifeBuoy className="h-6 w-6 text-primary" /> Dəstək
      </h1>
      <div className="grid lg:grid-cols-3 gap-3">
        <button
          className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary transition"
          onClick={() => toast.success("Texniki dəstəyə bağlanılır...")}
        >
          <PhoneCall className="h-6 w-6 text-primary mb-2" />
          <div className="font-bold">Texniki dəstək</div>
          <div className="text-xs text-muted-foreground">7/24 əlaqə xətti</div>
        </button>
        <button
          className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary transition"
          onClick={() => toast.success("Problem qeydiyyata alındı")}
        >
          <AlertTriangle className="h-6 w-6 text-amber-500 mb-2" />
          <div className="font-bold">Problem bildir</div>
          <div className="text-xs text-muted-foreground">Sistem / əməliyyat xətası</div>
        </button>
        <button
          className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary transition"
          onClick={() => toast.success("Şikayət göndərildi")}
        >
          <Undo2 className="h-6 w-6 text-rose-500 mb-2" />
          <div className="font-bold">Zədəli mal şikayəti</div>
          <div className="text-xs text-muted-foreground">Foto ilə birlikdə</div>
        </button>
      </div>
      {user && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold flex items-center gap-2 mt-6">
            🤖 AI Asistent — PVZ işçiləri üçün
          </h2>
          <p className="text-sm text-muted-foreground">
            QR skan, götürmə kodu, qaytarma, anbar, hesabat və s. üzrə dərhal cavab.
          </p>
          <AISupportChat userId={user.id} audience="pvz" />
        </div>
      )}
    </div>
  );
}

function PvzMessagesTab() {
  const { user } = useAuth();
  if (!user) {
    return <div className="text-sm text-muted-foreground">Giriş tələb olunur</div>;
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-primary" /> Müştəri mesajları
      </h1>
      <p className="text-sm text-muted-foreground">
        Hər sifariş üzrə müştəri ilə birbaşa yazışın. Paket qəbul edildikdə müştəriyə avtomatik
        bildiriş və mesaj gedir.
      </p>
      <PvzOrderChat mode="pvz" currentUserId={user.id} />
    </div>
  );
}
