import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Undo2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orderItemId: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  productTitle: string;
  deliveredAt: string | null;
  onDone?: () => void;
}

const REASONS = [
  "Məhsul təsvirə uyğun deyil",
  "Keyfiyyət problemi / qüsurlu",
  "Yanlış məhsul gəldi",
  "Ölçü / rəng uyğun deyil",
  "Fikrim dəyişdi",
  "Digər",
];

export function ReturnRequestDialog({
  open, onOpenChange, orderItemId, orderId, buyerId, sellerId, productTitle, deliveredAt, onDone,
}: Props) {
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  // 3-day window check
  const expired = (() => {
    if (!deliveredAt) return false;
    const ms = Date.now() - new Date(deliveredAt).getTime();
    return ms > 3 * 24 * 60 * 60 * 1000;
  })();

  const remainingHours = (() => {
    if (!deliveredAt) return null;
    const ms = 3 * 24 * 60 * 60 * 1000 - (Date.now() - new Date(deliveredAt).getTime());
    if (ms <= 0) return 0;
    return Math.ceil(ms / (60 * 60 * 1000));
  })();

  const submit = async () => {
    if (expired) { toast.error("Qaytarma müddəti bitib (3 gün keçib)"); return; }
    if (description.trim().length < 5) { toast.error("Qısa açıqlama yazın (min 5 simvol)"); return; }
    setBusy(true);
    const { error } = await supabase.from("returns").insert({
      order_id: orderId,
      order_item_id: orderItemId,
      buyer_id: buyerId,
      seller_id: sellerId,
      reason,
      description: description.trim(),
      status: "pending",
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Qaytarma istəyi göndərildi");
    onOpenChange(false);
    onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Undo2 className="h-5 w-5 text-primary" /> Qaytarma istəyi
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm font-semibold">{productTitle}</div>

          {expired ? (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              ⛔ Qaytarma müddəti bitib. Çatdırılmadan 3 gündən çox keçib, qaytarma qəbul olunmur.
            </div>
          ) : (
            <div className="text-xs bg-warning/10 border border-warning/30 text-warning-foreground rounded-lg p-2">
              ⏳ Qaytarmaq üçün qalıb: <b>{remainingHours} saat</b>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground">Səbəb</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 px-3 mt-1 rounded-lg border border-input bg-background">
              {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Açıqlama</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4} maxLength={500}
              placeholder="Qaytarma səbəbini ətraflı yazın..."
              className="w-full p-2 text-sm mt-1 rounded-lg border border-input bg-background resize-none" />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Ləğv et</Button>
            <Button onClick={submit} disabled={busy || expired}>
              {busy ? "..." : "İstək göndər"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
