import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Əlaqə — EG Shop" }, { name: "description", content: "EG Shop ilə əlaqə məlumatları" }] }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-black mb-6">Əlaqə</h1>
      <div className="space-y-4 bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /><span>info@elzanshop.az</span></div>
        <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><span>+994 50 000 00 00</span></div>
        <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><span>Bakı, Azərbaycan</span></div>
      </div>
    </div>
  );
}
