import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Giriş — One Board Market" }] }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Düzgün e-poçt daxil edin").max(255);
const passSchema = z.string().min(6, "Ən azı 6 simvol").max(72);
const nameSchema = z.string().trim().min(2, "Ən azı 2 simvol").max(100);

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailV = emailSchema.safeParse(email);
    const passV = passSchema.safeParse(password);
    if (!emailV.success) { toast.error(emailV.error.issues[0].message); return; }
    if (!passV.success) { toast.error(passV.error.issues[0].message); return; }
    if (mode === "signup") {
      const nameV = nameSchema.safeParse(name);
      if (!nameV.success) { toast.error(nameV.error.issues[0].message); return; }
    }

    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: name },
        },
      });
      if (error) toast.error(error.message);
      else { toast.success("Qeydiyyat tamamlandı!"); navigate({ to: "/" }); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("E-poçt və ya şifrə yanlışdır");
      else { toast.success("Xoş gəldiniz!"); navigate({ to: "/" }); }
    }
    setBusy(false);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card">
        <h1 className="text-2xl font-extrabold mb-1">{mode === "login" ? "Giriş" : "Qeydiyyat"}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "login" ? "Hesabınıza daxil olun" : "Yeni hesab yaradın"}
        </p>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ad Soyad" maxLength={100}
              className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="E-poçt" maxLength={255} autoComplete="email"
            className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifrə" maxLength={72} autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit" disabled={busy}
            className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "..." : mode === "login" ? "Daxil ol" : "Qeydiyyatdan keç"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-primary"
        >
          {mode === "login" ? "Hesabınız yoxdur? Qeydiyyatdan keçin" : "Hesabınız var? Daxil olun"}
        </button>
      </div>
    </div>
  );
}
