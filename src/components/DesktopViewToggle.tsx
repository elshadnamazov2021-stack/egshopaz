import { Monitor, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "elzan-desktop-view";
const DESKTOP_WIDTH = 1280;

function applyViewport(desktop: boolean) {
  let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "viewport";
    document.head.appendChild(meta);
  }
  meta.content = desktop
    ? `width=${DESKTOP_WIDTH}, initial-scale=${(window.screen.width / DESKTOP_WIDTH).toFixed(3)}`
    : "width=device-width, initial-scale=1";
}

export function DesktopViewToggle() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) === "1";
    if (saved) {
      setDesktop(true);
      applyViewport(true);
    }
  }, []);

  const toggle = () => {
    const next = !desktop;
    setDesktop(next);
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    applyViewport(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={desktop ? "Mobil versiya" : "Kompüter versiyası"}
      className="md:hidden flex flex-col items-center text-xs px-2 py-1.5 hover:text-primary transition shrink-0"
    >
      {desktop ? <Smartphone className="h-5 w-5 mb-0.5" /> : <Monitor className="h-5 w-5 mb-0.5" />}
      <span className="text-[10px]">{desktop ? "Mobil" : "PC"}</span>
    </button>
  );
}
