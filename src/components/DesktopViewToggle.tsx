import { Monitor, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "elzan-desktop-view";
// Smaller virtual width = larger, more readable text on mobile devices
const DESKTOP_WIDTH = 980;

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

function applyViewport(desktop: boolean) {
  let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "viewport";
    document.head.appendChild(meta);
  }
  if (desktop) {
    // Let the browser fit the desktop layout into the device width — keeps text legible
    meta.content = `width=${DESKTOP_WIDTH}, initial-scale=${(window.screen.width / DESKTOP_WIDTH).toFixed(3)}, maximum-scale=5.0, user-scalable=yes`;
  } else {
    meta.content = "width=device-width, initial-scale=1, maximum-scale=5.0, user-scalable=yes";
  }
}

export function DesktopViewToggle() {
  const [desktop, setDesktop] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(isTouchDevice());
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

  // Only show on touch devices (phones/tablets). Always visible there — including
  // when PC mode is on (otherwise users can't switch back).
  if (!touch) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={desktop ? "Mobil versiya" : "Kompüter versiyası"}
      className="flex flex-col items-center text-xs px-2 py-1.5 hover:text-primary transition shrink-0 border border-primary/40 rounded-md bg-primary/5"
      style={{ minWidth: 48 }}
    >
      {desktop ? <Smartphone className="h-5 w-5 mb-0.5" /> : <Monitor className="h-5 w-5 mb-0.5" />}
      <span className="text-[10px] font-semibold">{desktop ? "Mobil" : "PC"}</span>
    </button>
  );
}
