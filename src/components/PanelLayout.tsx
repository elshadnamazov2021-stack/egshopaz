import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Clock } from "lucide-react";

function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const date = now.toLocaleDateString("az-AZ", { weekday: "short", day: "2-digit", month: "short" });
  return (
    <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-gradient-soft border border-border">
      <Clock className="h-4 w-4 text-primary shrink-0" />
      <div className="min-w-0">
        <div className="font-mono font-bold text-sm tabular-nums leading-tight">{time}</div>
        <div className="text-[10px] text-muted-foreground capitalize leading-tight">{date}</div>
      </div>
    </div>
  );
}

export interface PanelNavItem {
  to?: string;
  key?: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
}

interface Props {
  title: string;
  subtitle?: string;
  items: PanelNavItem[];
  children: ReactNode;
}

export function PanelLayout({ title, subtitle, items, children }: Props) {
  const { pathname } = useLocation();

  return (
    <div className="container mx-auto px-4 py-6 grid gap-4 lg:grid-cols-[260px_1fr] lg:gap-6">
      <aside className="bg-card border border-border rounded-2xl p-3 h-fit lg:sticky lg:top-20 lg:self-start">
        <div className="px-3 py-3 border-b border-border mb-3 lg:mb-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{title}</div>
          {subtitle && <div className="text-sm font-bold mt-0.5 line-clamp-1">{subtitle}</div>}
        </div>
        <LiveClock />
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-0.5 lg:overflow-visible lg:pb-0">
          {items.map((it) => {
            const isActive = it.active ?? (it.to ? pathname === it.to : false);
            const cls = `flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-2.5 rounded-lg text-sm font-medium transition text-left lg:w-full lg:gap-3 ${
              isActive ? "bg-gradient-soft text-primary font-semibold" : "hover:bg-secondary text-foreground/80"
            }`;
            const inner = (
              <>
                <it.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{it.label}</span>
                {it.badge !== undefined && it.badge > 0 && (
                  <span className="text-[10px] bg-discount text-discount-foreground rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center">
                    {it.badge}
                  </span>
                )}
              </>
            );
            if (it.onClick) {
              return (
                <button key={it.key ?? it.label} onClick={it.onClick} className={cls}>
                  {inner}
                </button>
              );
            }
            return (
              <Link key={it.to ?? it.label} to={it.to!} className={cls}>
                {inner}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
