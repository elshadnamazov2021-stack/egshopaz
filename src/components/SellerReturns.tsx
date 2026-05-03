import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Undo2, Eye, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ReturnRow {
  id: string;
  pickup_code: string | null;
  reason: string;
  description: string | null;
  buyer_explanation: string | null;
  status: string;
  cost_paid_by: string;
  images: string[];
  pvz_received_at: string | null;
  seller_received_at: string | null;
  created_at: string;
  buyer_id: string;
  order_item_id: string;
  order_items: { title: string; orders: { recipient_name: string | null; recipient_phone: string | null } | null } | null;
}

export function SellerReturns({ sellerId }: { sellerId: string }) {
  const [list, setList] = useState<ReturnRow[]>([]);
  const [view, setView] = useState<ReturnRow | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("returns")
      .select("id,pickup_code,reason,description,buyer_explanation,status,cost_paid_by,images,pvz_received_at,seller_received_at,created_at,buyer_id,order_item_id,order_items(title,orders(recipient_name,recipient_phone))")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .limit(200);
    setList((data ?? []) as unknown as ReturnRow[]);
  };

  useEffect(() => { void load(); }, [sellerId]);

  const update = async (r: ReturnRow, status: "approved" | "rejected" | "completed") => {
    const patch: { status: string; seller_received_at?: string; resolved_at?: string } = { status };
    if (status === "completed") {
      patch.seller_received_at = new Date().toISOString();
      patch.resolved_at = new Date().toISOString();
    }
    const { error } = await supabase.from("returns").update(patch).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Yeniləndi");
    setView(null);
    void load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <Undo2 className="h-6 w-6 text-primary" /> Qaytarmalar ({list.length})
      </h1>
      <div className="bg-card border border-border rounded-2xl p-4 overflow-x-auto">
        {list.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">Qaytarma yoxdur</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kod</TableHead>
                <TableHead>Müştəri</TableHead>
                <TableHead>Məhsul</TableHead>
                <TableHead>Səbəb</TableHead>
                <TableHead>Xərc</TableHead>
                <TableHead>PVZ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bax</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.pickup_code}</TableCell>
                  <TableCell className="text-xs">
                    {r.order_items?.orders?.recipient_name ?? "—"}
                    <div className="text-[10px] text-muted-foreground">{r.order_items?.orders?.recipient_phone ?? ""}</div>
                  </TableCell>
                  <TableCell className="text-xs">{r.order_items?.title ?? "—"}</TableCell>
                  <TableCell className="text-xs">{r.reason}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${r.cost_paid_by === "seller" ? "bg-destructive/10 text-destructive" : "bg-warning/20"}`}>
                      {r.cost_paid_by === "seller" ? "Sizin" : "Müştəri"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {r.pvz_received_at ? <span className="text-emerald-600">✓ Qəbul</span> : <span className="text-muted-foreground">Gözləyir</span>}
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-secondary">{r.status}</span>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => setView(r)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!view} onOpenChange={(v) => !v && setView(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Qaytarma — {view?.pickup_code}</DialogTitle>
          </DialogHeader>
          {view && (
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Məhsul</div>
                <div className="font-semibold">{view.order_items?.title}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Müştəri</div>
                  <div>{view.order_items?.orders?.recipient_name ?? "—"}</div>
                  <div className="text-xs">{view.order_items?.orders?.recipient_phone ?? ""}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Xərc kim</div>
                  <div className={view.cost_paid_by === "seller" ? "text-destructive font-semibold" : "font-semibold"}>
                    {view.cost_paid_by === "seller" ? "Siz ödəyirsiniz" : "Müştəri ödəyir"}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Səbəb</div>
                <div>{view.reason}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Müştərinin izahı</div>
                <div className="bg-secondary/40 p-2 rounded text-xs">{view.buyer_explanation || view.description || "—"}</div>
              </div>
              {view.images.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Şəkillər ({view.images.length})</div>
                  <div className="grid grid-cols-3 gap-2">
                    {view.images.map((u) => (
                      <a key={u} href={u} target="_blank" rel="noreferrer" className="aspect-square rounded overflow-hidden border">
                        <img src={u} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end pt-2 flex-wrap">
                {view.status === "pending" && (
                  <>
                    <Button variant="outline" onClick={() => update(view, "rejected")}>
                      <XCircle className="h-4 w-4 mr-1" /> Rədd et
                    </Button>
                    <Button onClick={() => update(view, "approved")}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Təsdiqlə
                    </Button>
                  </>
                )}
                {(view.status === "approved" && view.pvz_received_at) && (
                  <Button onClick={() => update(view, "completed")}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Məhsul gəldi — tamamla
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
