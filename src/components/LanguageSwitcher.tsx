import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGS: { code: "az" | "ru" | "en"; label: string; flag: string }[] = [
  { code: "az", label: "Azərbaycan", flag: "🇦🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const current = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-secondary transition outline-none text-sm">
        <Globe className="h-4 w-4" />
        {compact ? (
          <span className="font-semibold uppercase text-xs">{current.code}</span>
        ) : (
          <>
            <span>{current.flag}</span>
            <span className="hidden sm:inline font-medium">{current.code.toUpperCase()}</span>
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => i18n.changeLanguage(l.code)}
            className={l.code === current.code ? "bg-secondary font-semibold" : ""}
          >
            <span className="mr-2 text-base">{l.flag}</span>
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
