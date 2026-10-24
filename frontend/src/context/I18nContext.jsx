import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGES, translate } from "../i18n/translations";
import { useLocation } from "react-router-dom";

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

  const setLang = useCallback((code) => {
    setLangState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key, values) => translate(lang, key, values),
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
