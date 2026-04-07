import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../i18n/translations";

const AppContext = createContext(null);

const FONT_SIZES = ["sm", "md", "lg", "xl"];
const LANGS = ["pt-BR", "en", "es"];

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem("lang") || "pt-BR"
  );
  const [fontSize, setFontSizeState] = useState(
    () => localStorage.getItem("fontSize") || "md"
  );
  const [contrast, setContrastState] = useState(
    () => localStorage.getItem("contrast") || "normal"
  );

  // Aplica no <html> para que o CSS via data-attributes funcione
  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute("data-fontsize", fontSize);
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute("data-contrast", contrast);
    localStorage.setItem("contrast", contrast);
  }, [contrast]);

  function setLang(value) {
    if (LANGS.includes(value)) setLangState(value);
  }
  function setFontSize(value) {
    if (FONT_SIZES.includes(value)) setFontSizeState(value);
  }
  function setContrast(value) {
    setContrastState(value === "high" ? "high" : "normal");
  }

  /** Retorna a string traduzida para a chave fornecida. */
  function t(key) {
    return (
      translations[lang]?.[key] ??
      translations["pt-BR"]?.[key] ??
      key
    );
  }

  return (
    <AppContext.Provider
      value={{ lang, setLang, fontSize, setFontSize, contrast, setContrast, t }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de <AppProvider>");
  return ctx;
}
