import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { toast } from "sonner";
import { ShoppingBag, Store, Package, Eye, EyeOff } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Giriş / Qeydiyyat — Elzan Shop" }] }),
  component: AuthPage,
});

type RoleTab = "buyer" | "seller" | "pvz";

const TERMS_TEXT: Record<RoleTab, { title: string; body: string }> = {
  buyer: {
    title: "Müştəri istifadəçi razılaşması",
    body: `Elzan Shop platformasından istifadə etməklə Siz aşağıdakı şərtləri qəbul edirsiniz:

1. Şəxsi məlumatlarınız (ad, telefon, ünvan) yalnız sifariş və çatdırılma məqsədilə istifadə olunur.
2. Sifariş verdikdən sonra ödəniş və qaytarma qaydalarına riayət etməlisiniz.
3. Saxta hesab yaratmaq, başqa istifadəçiləri narahat etmək və ya saxta sifariş vermək qadağandır.
4. Bonus və endirimlər platforma tərəfindən istənilən vaxt dəyişdirilə bilər.
5. Bütün məhsullar satıcılar tərəfindən təqdim olunur. Mübahisə yarandıqda Elzan Shop vasitəçi rolunu oynayır.

Qeydiyyatdan keçməklə Siz yuxarıdakı şərtləri oxuduğunuzu və qəbul etdiyinizi təsdiqləyirsiniz.`,
  },
  seller: {
    title: "Satıcı razılaşması",
    body: `Elzan Shop-da satıcı kimi qeydiyyatdan keçməklə Siz aşağıdakı öhdəlikləri qəbul edirsiniz:

1. Satılan məhsulların orijinal, qanuni və təsvirə uyğun olmasına zəmanət verirsiniz.
2. Sifariş qəbul olunduqdan sonra 48 saat ərzində paketin göndərilməsi tələb olunur.
3. Platformanın komissiya dərəcəsi (cari: 10%) hər satışdan tutulur.
4. Müştəri ilə kobud davranış, qiymət şişirtməsi və saxta məhsul satışı hesabın bağlanmasına səbəb olur.
5. Mübahisə yarandıqda admin qərarına tabe olmağa razısınız.
6. VÖEN/şəxsiyyət məlumatları yoxlama məqsədilə platforma tərəfindən saxlanılır.

Qeydiyyatdan keçməklə bu şərtləri tam qəbul edirsiniz.`,
  },
  pvz: {
    title: "PVZ (çatdırılma nöqtəsi) işçi razılaşması",
    body: `Elzan Shop PVZ işçisi kimi qeydiyyatdan keçməklə Siz aşağıdakı qaydaları qəbul edirsiniz:

1. Paketləri qəbul etmək və müştəriyə yalnız doğru kod/QR yoxlamasından sonra təhvil vermək.
2. PVZ-nin iş saatlarına dəqiq riayət etmək.
3. Müştəri ilə hörmətlə davranmaq, mübahisə yarandıqda admin və ya menecerlə əlaqə saxlamaq.
4. Paketin zədələnməsi, itməsi halında dərhal sistemdə qeyd etmək.
5. Şəxsi və müştəri məlumatlarının məxfiliyini qoruyub saxlamaq.
6. PVZ nöqtəsinin avadanlıqlarına və malına məsuliyyət daşıyırsınız.

Qeydiyyatdan keçməklə bu qaydalara əməl etməyə razılıq verirsiniz.`,
  },
};

function AuthPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<RoleTab>("buyer");

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);

  // seller
  const [shopName, setShopName] = useState("");
  const [shopCity, setShopCity] = useState("");
  const [voen, setVoen] = useState("");

  // pvz
  const [pvzList, setPvzList] = useState<{ id: string; name: string; city: string }[]>([]);
  const [pickupPointId, setPickupPointId] = useState<string>("");
  const [position, setPosition] = useState("operator");

  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const sendReset = async () => {
    const v = z.string().trim().email("Yanlış e-poçt").safeParse(forgotEmail);
    if (!v.success) { toast.error(v.error.issues[0].message); return; }
    setForgotBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bərpa linki e-poçtunuza göndərildi");
    setForgotOpen(false);
    setForgotEmail("");
  };

  useEffect(() => {
    if (role !== "pvz") return;
    supabase.from("pickup_points").select("id,name,city").eq("is_active", true).order("city")
      .then(({ data }) => setPvzList(data ?? []));
  }, [role]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailV = z.string().trim().email("Yanlış e-poçt").max(255).safeParse(email);
    if (!emailV.success) { toast.error(emailV.error.issues[0].message); return; }
    const passV = z.string().min(6, "Şifrə minimum 6 simvol").max(72).safeParse(password);
    if (!passV.success) { toast.error(passV.error.issues[0].message); return; }

    if (mode === "login") {
      setBusy(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error("E-poçt və ya şifrə yanlışdır"); return; }
      toast.success("Xoş gəldiniz!");
      navigate({ to: "/" });
      return;
    }

    // signup validations
    if (!agree) { toast.error("Müqavilə şərtlərini qəbul etməlisiniz"); return; }
    if (name.trim().length < 2) { toast.error("Ad daxil edin"); return; }
    if (phone.trim().length < 7) { toast.error("Telefon nömrəsi daxil edin"); return; }

    if (role === "seller") {
      if (shopName.trim().length < 2) { toast.error("Mağaza adı daxil edin"); return; }
      if (shopCity.trim().length < 2) { toast.error("Şəhər daxil edin"); return; }
    }
    if (role === "pvz") {
      if (!pickupPointId) { toast.error("PVZ nöqtəsini seçin"); return; }
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: name, phone },
      },
    });
    if (error) { setBusy(false); toast.error(error.message); return; }

    // ensure session available for RPC
    if (!data.session) {
      // try sign-in (works when auto-confirm is on)
      await supabase.auth.signInWithPassword({ email, password }).catch(() => {});
    }

    if (role === "seller") {
      const { error: e2 } = await supabase.rpc("register_seller", {
        _shop_name: shopName.trim().slice(0, 100),
        _shop_city: shopCity.trim(),
        _phone: phone.trim(),
        _voen: voen.trim() || undefined,
      });
      if (e2) { setBusy(false); toast.error(e2.message); return; }
      toast.success("Satıcı qeydiyyatınız tamamlandı");
      setBusy(false);
      navigate({ to: "/seller" });
      return;
    }

    if (role === "pvz") {
      const { error: e3 } = await supabase.rpc("register_pvz_staff", {
        _full_name: name.trim(),
        _phone: phone.trim(),
        _pickup_point_id: pickupPointId,
        _position: position,
      });
      if (e3) { setBusy(false); toast.error(e3.message); return; }
      toast.success("PVZ işçi qeydiyyatı tamamlandı");
      setBusy(false);
      navigate({ to: "/pvz" });
      return;
    }

    // buyer
    setBusy(false);
    toast.success("Qeydiyyat uğurla tamamlandı");
    navigate({ to: "/" });
  };

  const inputCls = "w-full h-11 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring";

  const tabs: { key: RoleTab; label: string; Icon: typeof Store }[] = [
    { key: "buyer", label: "Müştəri", Icon: ShoppingBag },
    { key: "seller", label: "Satıcı", Icon: Store },
    { key: "pvz", label: "PVZ işçisi", Icon: Package },
  ];

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card">
        <h1 className="text-2xl font-extrabold mb-1">{mode === "login" ? "Giriş" : "Qeydiyyat"}</h1>
        <p className="text-sm text-muted-foreground mb-5">
          {mode === "login" ? "Hesabınıza daxil olun" : "Hesab tipinizi seçin"}
        </p>

        {mode === "signup" && (
          <div className="grid grid-cols-3 gap-2 mb-5 p-1 bg-muted rounded-xl">
            {tabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                className={`flex flex-col items-center gap-1 py-3 rounded-lg text-xs font-semibold transition ${
                  role === key ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder={role === "pvz" ? "Tam ad (Soyad Ad)" : "Ad Soyad"}
                maxLength={100} className={inputCls} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefon (məs. +994551234567)" maxLength={20} className={inputCls} />
            </>
          )}

          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="E-poçt" maxLength={255} autoComplete="email" className={inputCls} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifrə (minimum 6 simvol)" maxLength={72}
            autoComplete={mode === "login" ? "current-password" : "new-password"} className={inputCls} />

          {mode === "signup" && role === "seller" && (
            <>
              <input value={shopName} onChange={(e) => setShopName(e.target.value)}
                placeholder="Mağaza adı" maxLength={100} className={inputCls} />
              <input value={shopCity} onChange={(e) => setShopCity(e.target.value)}
                placeholder="Şəhər (məs. Bakı)" maxLength={50} className={inputCls} />
              <input value={voen} onChange={(e) => setVoen(e.target.value)}
                placeholder="VÖEN (ixtiyari)" maxLength={20} className={inputCls} />
            </>
          )}

          {mode === "signup" && role === "pvz" && (
            <>
              <select value={pickupPointId} onChange={(e) => setPickupPointId(e.target.value)} className={inputCls}>
                <option value="">— PVZ nöqtəsini seçin —</option>
                {pvzList.map((p) => (
                  <option key={p.id} value={p.id}>{p.city} — {p.name}</option>
                ))}
              </select>
              <select value={position} onChange={(e) => setPosition(e.target.value)} className={inputCls}>
                <option value="operator">Operator</option>
                <option value="manager">Menecer</option>
                <option value="courier">Kuryer</option>
              </select>
            </>
          )}

          {mode === "signup" && (
            <label className="flex items-start gap-2 text-sm text-muted-foreground pt-1">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 accent-primary" />
              <span>
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="text-primary underline underline-offset-2 hover:opacity-80">
                      {TERMS_TEXT[role].title}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>{TERMS_TEXT[role].title}</DialogTitle></DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                      <p className="text-sm whitespace-pre-line leading-relaxed">{TERMS_TEXT[role].body}</p>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                {" "}— oxudum və qəbul edirəm.
              </span>
            </label>
          )}

          <button type="submit" disabled={busy}
            className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 disabled:opacity-60">
            {busy ? "..." : mode === "login" ? "Daxil ol" : (
              role === "seller" ? "Satıcı kimi qeydiyyat" : role === "pvz" ? "PVZ işçisi kimi qeydiyyat" : "Qeydiyyat"
            )}
          </button>
        </form>

        {mode === "login" && (
          <button type="button" onClick={() => { setForgotEmail(email); setForgotOpen(true); }}
            className="mt-3 w-full text-sm text-primary hover:underline">
            Şifrəmi unutdum
          </button>
        )}

        <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-primary">
          {mode === "login" ? "Hesabınız yoxdur? Qeydiyyat" : "Artıq hesabınız var? Daxil olun"}
        </button>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Şifrəni bərpa et</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            E-poçtunuzu daxil edin — bərpa linki göndəriləcək. Müştəri, satıcı və PVZ işçiləri üçün eyni qaydada işləyir.
          </p>
          <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
            placeholder="E-poçt" maxLength={255}
            className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={sendReset} disabled={forgotBusy}
            className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 disabled:opacity-60">
            {forgotBusy ? "..." : "Bərpa linkini göndər"}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
