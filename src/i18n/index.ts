import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import az from "./locales/az.json";
import ru from "./locales/ru.json";
import en from "./locales/en.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      az: { translation: az },
      ru: { translation: ru },
      en: { translation: en },
    },
    fallbackLng: "az",
    supportedLngs: ["az", "ru", "en"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "elzan_lang",
    },
  });

export default i18n;
