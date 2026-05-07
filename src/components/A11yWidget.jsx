import { useState } from "react";
import { useApp } from "../context/AppContext";

const LANGS = [
  { code: "pt-BR", label: "PT", full: "Português"  },
  { code: "en",    label: "EN", full: "English"    },
  { code: "es",    label: "ES", full: "Español"    },
];

const FONT_SIZES = [
  { value: "sm", label: "A", title: "Texto pequeno",       size: "0.72rem" },
  { value: "md", label: "A", title: "Texto médio (padrão)", size: "0.85rem" },
  { value: "lg", label: "A", title: "Texto grande",         size: "1rem"   },
  { value: "xl", label: "A", title: "Texto extra grande",   size: "1.18rem" },
];

/**
 * Widget de acessibilidade fixo — posicionado ao lado do botão VLibras
 * (canto inferior esquerdo). Controles: idioma, tamanho de fonte, alto contraste.
 * Libras é gerenciada pelo widget VLibras externo (index.html).
 */
export default function A11yWidget() {
  const { lang, setLang, fontSize, setFontSize, contrast, setContrast, t } = useApp();
  const [open, setOpen] = useState(false);

  const isHighContrast = contrast === "high";

  return (
    <div className="a11y-widget" role="region" aria-label={t("a11y.open")}>

      {/* Painel expandido — abre acima do botão de toggle */}
      {open && (
        <div
          className="a11y-panel"
          role="dialog"
          aria-modal="false"
          aria-label={t("a11y.open")}
        >
          <div className="a11y-panel-header">
            <span className="a11y-panel-title">{t("a11y.open")}</span>
            <button
              className="a11y-close"
              onClick={() => setOpen(false)}
              aria-label={t("a11y.close")}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="1" y1="1" x2="9" y2="9" />
                <line x1="9" y1="1" x2="1" y2="9" />
              </svg>
            </button>
          </div>

          {/* Idioma */}
          <div className="a11y-section">
            <span className="a11y-section-label" id="a11y-lang-label">
              {t("a11y.language")}
            </span>
            <div className="a11y-lang-group" role="group" aria-labelledby="a11y-lang-label">
              {LANGS.map(({ code, label, full }) => (
                <button
                  key={code}
                  className={`a11y-lang-btn${lang === code ? " active" : ""}`}
                  onClick={() => setLang(code)}
                  aria-label={full}
                  aria-pressed={lang === code}
                  title={full}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tamanho da fonte */}
          <div className="a11y-section">
            <span className="a11y-section-label" id="a11y-font-label">
              {t("a11y.fontSize")}
            </span>
            <div className="a11y-font-group" role="group" aria-labelledby="a11y-font-label">
              {FONT_SIZES.map(({ value, label, title, size }) => (
                <button
                  key={value}
                  className={`a11y-font-btn${fontSize === value ? " active" : ""}`}
                  onClick={() => setFontSize(value)}
                  aria-label={title}
                  aria-pressed={fontSize === value}
                  title={title}
                  style={{ fontSize: size }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Alto contraste */}
          <div className="a11y-section">
            <span className="a11y-section-label">{t("a11y.contrast")}</span>
            <div className="a11y-contrast-row" onClick={() => setContrast(isHighContrast ? "normal" : "high")}>
              <span className="a11y-contrast-label">
                {isHighContrast ? "Ativado" : "Desativado"}
              </span>
              <button
                className="a11y-contrast-btn"
                aria-pressed={isHighContrast}
                aria-label={t("a11y.contrast")}
                tabIndex={-1}
              >
                <span className="a11y-switch-track">
                  <span className="a11y-switch-thumb" />
                </span>
              </button>
            </div>
          </div>

          {/* VLibras — informativo */}
          <div className="a11y-section">
            <span className="a11y-section-label">{t("a11y.libras")}</span>
            <p className="a11y-libras-note">
              Clique no botão VLibras no canto inferior esquerdo para ativar a tradução em Libras.
            </p>
          </div>
        </div>
      )}

      {/* Botão de abertura */}
      <button
        className="a11y-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("a11y.open")}
        aria-expanded={open}
        title={t("a11y.open")}
      >
        {/* Símbolo de acessibilidade */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="4" r="2" />
          <path d="M7 9h10" />
          <path d="M12 6v6" />
          <path d="M9 21l3-5 3 5" />
        </svg>
      </button>
    </div>
  );
}
