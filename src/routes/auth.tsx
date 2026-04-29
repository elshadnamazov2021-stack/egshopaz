import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Giriş — Elzan Shop" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const emailSchema = z.string().trim().email(t("auth.invalidEmail")).max(255);
  const passSchema = z.string().min(6, t("auth.minPassword")).max(72);
  const nameSchema = z.string().trim().min(2, t("auth.minName")).max(100);

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
      else { toast.success(t("auth.registerSuccess")); navigate({ to: "/" }); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(t("auth.wrongCredentials"));
      else { toast.success(t("auth.welcome")); navigate({ to: "/" }); }
    }
    setBusy(false);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card">
        <h1 className="text-2xl font-extrabold mb-1">{mode === "login" ? t("auth.login") : t("auth.register")}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "login" ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
        </p>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t("auth.fullName")} maxLength={100}
              className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.email")} maxLength={255} autoComplete="email"
            className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.password")} maxLength={72} autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit" disabled={busy}
            className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "..." : mode === "login" ? t("auth.loginBtn") : t("auth.registerBtn")}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-primary"
        >
          {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
        </button>
      </div>
    </div>
  );
}
