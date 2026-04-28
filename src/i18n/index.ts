import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import az from "./locales/az.json";
import ru from "./locales/ru.json";
import en from "./locales/en.json";

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      az: { translation: az },
      ru: { translation: ru },
      en: { translation: en },
    },
    lng: "az",
    fallbackLng: "az",
    supportedLngs: ["az", "ru", "en"],
    interpolation: { escapeValue: false },
  });

// After hydration, sync with user-selected language from localStorage
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("elzan_lang");
  if (saved && ["az", "ru", "en"].includes(saved) && saved !== "az") {
    // Defer change until after hydration completes
    setTimeout(() => { void i18n.changeLanguage(saved); }, 0);
  }
}

export default i18n;
