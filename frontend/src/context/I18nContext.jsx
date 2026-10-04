import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGES, translations } from "../i18n/translations";

const I18nContext = createContext(null);
const STORAGE_KEY = "rently_lang";

function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch {
    /* storage unavailable */
  }
  return "en";
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  // Keep <html lang> and direction (RTL for Arabic) in sync
  useEffect(() => {
    document.documentElement.lang = current.code;
    document.documentElement.dir = current.dir;
  }, [current]);

  const setLang = useCallback((code) => {
    setLangState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key) => (lang === "en" ? key : translations[lang]?.[key] ?? key),
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, dir: current.dir, languages: LANGUAGES }),
    [lang, setLang, t, current.dir]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
