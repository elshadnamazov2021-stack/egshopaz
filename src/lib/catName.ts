import i18n from "@/i18n";

export interface LocalizedCategory {
  name: string;
  name_ru?: string | null;
  name_en?: string | null;
}

export function catName(c: LocalizedCategory | null | undefined): string {
  if (!c) return "";
  const lang = i18n.language || "az";
  if (lang.startsWith("ru") && c.name_ru) return c.name_ru;
  if (lang.startsWith("en") && c.name_en) return c.name_en;
  return c.name;
}
