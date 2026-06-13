import { createFileRoute, Link } from "@tanstack/react-router";
import { Smartphone, Apple, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "EG Shop tətbiqini yüklə — Android & iOS" },
      { name: "description", content: "EG Shop mobil tətbiqini telefonunuza yükləyin. Daha sürətli alış-veriş, bildirişlər və xüsusi endirimlər." },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="text-center">
        <div className="inline-flex h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 items-center justify-center text-primary-foreground shadow-xl">
          <Smartphone className="h-10 w-10" />
        </div>
        <h1 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight">
          EG Shop tətbiqini yüklə
        </h1>
        <p className="mt-3 text-muted-foreground">
          Daha sürətli alış-veriş, push bildirişlər və yalnız tətbiqdə olan endirimlər.
        </p>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <a
          href="#"
          className="group rounded-2xl border border-border bg-card p-5 flex items-center gap-4 hover:border-primary hover:shadow-lg transition"
        >
          <div className="h-12 w-12 rounded-xl bg-foreground text-background flex items-center justify-center">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Android üçün</div>
            <div className="font-bold">Google Play / APK</div>
          </div>
        </a>
        <a
          href="#"
          className="group rounded-2xl border border-border bg-card p-5 flex items-center gap-4 hover:border-primary hover:shadow-lg transition"
        >
          <div className="h-12 w-12 rounded-xl bg-foreground text-background flex items-center justify-center">
            <Apple className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">iPhone üçün</div>
            <div className="font-bold">App Store</div>
          </div>
        </a>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-secondary/40 p-5">
        <div className="font-semibold mb-3">Tətbiqdə nə var?</div>
        <ul className="space-y-2 text-sm">
          {[
            "Sürətli və hamar alış-veriş təcrübəsi",
            "Sifariş statusu üçün push bildirişlər",
            "Yalnız tətbiqdə olan endirim və kampaniyalar",
            "Sevimlilər və səbət telefonunuzda bir kliklə",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Tətbiq hazırlanır. Bu vaxt saytdan istifadə edə bilərsiniz.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Ana səhifəyə qayıt</Link>
        </Button>
      </div>
    </div>
  );
}
