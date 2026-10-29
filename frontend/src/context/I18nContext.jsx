import { createContext, useContext, useEffect, useState } from "react";
import { LANGUAGES, translate } from "../i18n/translations";
import { useLocation } from "react-router-dom";

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

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const { pathname } = useLocation();
  const [lang, setLangState] = useState(getInitialLang);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const isClientPage = pathname === "/" || pathname === "/faqs" || /^\/vehicles(?:\/|$)/.test(pathname);
  const pageLang = isClientPage ? "en" : current.code;
  const pageDir = isClientPage ? "ltr" : current.dir;

  // Public pages use English copy; keep the saved admin language scoped to admin/auth pages.
  useEffect(() => {
    document.documentElement.lang = pageLang;
    document.documentElement.dir = pageDir;
  }, [pageLang, pageDir]);

  const setLang = (code) => {
    setLangState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  };

  const t = (key, values) => translate(lang, key, values);

  const value = { lang, setLang, t, dir: current.dir, languages: LANGUAGES };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within I18nProvider");
  return value;
}
