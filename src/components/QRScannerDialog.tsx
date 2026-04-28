import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
// Vite: bundle the worker as an asset and give qr-scanner an explicit URL
import qrWorkerUrl from "qr-scanner/qr-scanner-worker.min.js?url";
import { Camera, X, RefreshCw, FlashlightOff, Flashlight, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// @ts-expect-error – static field on the default export
QrScanner.WORKER_PATH = qrWorkerUrl;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onScan: (value: string) => void;
  title?: string;
}

export function QRScannerDialog({ open, onOpenChange, onScan, title = "QR / Ştrixkod skan" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastValue, setLastValue] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !videoRef.current) return;
    setError(null);
    setLastValue(null);

    const scanner = new QrScanner(
      videoRef.current,
      (res) => {
        if (!res?.data) return;
        setLastValue(res.data);
        scanner.stop();
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5,
      }
    );
    scannerRef.current = scanner;

    scanner.start()
      .then(async () => {
        const flash = await scanner.hasFlash();
        setHasFlash(flash);
      })
      .catch((e: any) => {
        setError(e?.message || "Kameraya giriş alınmadı. İcazələri yoxlayın.");
      });

    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
      setFlashOn(false);
    };
  }, [open]);

  const accept = () => {
    if (!lastValue) return;
    onScan(lastValue);
    onOpenChange(false);
  };

  const rescan = () => {
    setLastValue(null);
    scannerRef.current?.start().catch(() => {});
  };

  const toggleFlash = async () => {
    if (!scannerRef.current) return;
    try {
      await scannerRef.current.toggleFlash();
      setFlashOn(scannerRef.current.isFlashOn());
    } catch {
      toast.error("Fənər mövcud deyil");
    }
  };

  const onFile = async (f: File) => {
    try {
      const res = await QrScanner.scanImage(f, { returnDetailedScanResult: true });
      setLastValue(res.data);
      scannerRef.current?.stop();
    } catch {
      toast.error("Şəkildə QR tapılmadı");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" /> {title}
          </DialogTitle>
        </DialogHeader>

        <div className="relative bg-black aspect-square">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center bg-black/70">
              <X className="h-10 w-10 mb-2 text-rose-400" />
              <p className="text-sm">{error}</p>
              <p className="text-xs text-white/60 mt-2">Telefonun parametrlərində kamera icazəsini açın.</p>
            </div>
          )}
          {lastValue && (
            <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm">
              <div className="bg-card rounded-xl p-4 max-w-[85%] text-center shadow-2xl">
                <div className="text-xs text-muted-foreground mb-1">Tapıldı</div>
                <div className="font-mono text-sm break-all">{lastValue}</div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          {!lastValue ? (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
                <ImageIcon className="h-4 w-4 mr-1" /> Şəkildən
              </Button>
              {hasFlash && (
                <Button variant="outline" onClick={toggleFlash}>
                  {flashOn ? <Flashlight className="h-4 w-4" /> : <FlashlightOff className="h-4 w-4" />}
                </Button>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden
                     onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={rescan}>
                <RefreshCw className="h-4 w-4 mr-1" /> Yenidən skan
              </Button>
              <Button className="flex-1" onClick={accept}>
                Təsdiqlə
              </Button>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground text-center">
            Kameranı QR kod / ştrixkoda yönəldin. Avtomatik tanınacaq.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
