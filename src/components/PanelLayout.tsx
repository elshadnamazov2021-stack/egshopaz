import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface PanelNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface Props {
  title: string;
  subtitle?: string;
  items: PanelNavItem[];
  children: ReactNode;
}

export function PanelLayout({ title, subtitle, items, children }: Props) {
  const { pathname, hash } = useLocation();
  const current = pathname + (hash ? `#${hash}` : "");

  return (
    <div className="container mx-auto px-4 py-6 grid lg:grid-cols-[260px_1fr] gap-6">
      <aside className="bg-card border border-border rounded-2xl p-3 h-fit lg:sticky lg:top-20 self-start">
        <div className="px-3 py-3 border-b border-border mb-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{title}</div>
          {subtitle && <div className="text-sm font-bold mt-0.5 line-clamp-1">{subtitle}</div>}
        </div>
        <nav className="space-y-0.5">
          {items.map((it) => {
            const active =
              it.to === current ||
              (it.to.includes("#") && current === it.to) ||
              (!it.to.includes("#") && pathname === it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active ? "bg-gradient-soft text-primary font-semibold" : "hover:bg-secondary text-foreground/80"
                }`}
              >
                <it.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{it.label}</span>
                {it.badge !== undefined && it.badge > 0 && (
                  <span className="text-[10px] bg-discount text-discount-foreground rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center">
                    {it.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
