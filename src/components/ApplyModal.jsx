import { useState } from "react";
import { useApp } from "../context/AppContext";
import { jobsService } from "../services/jobsService";

const MODALITY_OPTIONS = [
  "FIC",
  "TECNICO",
  "CAI",
  "SUPERIOR",
  "POS_GRADUACAO",
  "EGRESSO",
];

const INITIAL_FORM = {
  cpf: "",
  name: "",
  birthDate: "",
  modality: "",
  className: "",
  classYear: "",
  lgpdConsent: false,
};

/**
 * Modal de candidatura — fluxo:
 *  step 1 → CPF: verifica se já existe candidato
 *  step 2 → Formulário: preenche (ou confirma) dados
 *  step 3 → Sucesso: exibe contatos da empresa revelados
 */
export default function ApplyModal({ job, onClose }) {
  const { t, lang } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [returning, setReturning] = useState(false);
  const [contact, setContact] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const DATE_LOCALE = { "pt-BR": "pt-BR", en: "en-US", es: "es-ES" };
  const dateLocale = DATE_LOCALE[lang] || "pt-BR";

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  // ── Step 1: verifica CPF ───────────────────────────────────────────────────
  async function handleCheckCpf(e) {
    e.preventDefault();
    if (!form.cpf.trim()) return;
    setError("");
    setLoading(true);
    try {
      const result = await jobsService.checkCpf(job.id, form.cpf);
      if (result.found) {
        setForm((prev) => ({
          ...prev,
          name:      result.name      || "",
          birthDate: result.birthDate ? result.birthDate.split("T")[0] : "",
          modality:  result.modality  || "",
          className: result.className || "",
          classYear: result.classYear ? String(result.classYear) : "",
        }));
        setReturning(true);
      }
      setStep(2);
    } catch {
      setError("Erro ao verificar CPF. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: envia candidatura ──────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.lgpdConsent) {
      setError(t("apply.lgpd"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await jobsService.apply(job.id, {
        cpf:         form.cpf,
        name:        form.name,
        birthDate:   form.birthDate,
        modality:    form.modality,
        className:   form.className || undefined,
        classYear:   form.classYear || undefined,
        lgpdConsent: true,
      });
      setContact(result);
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (err.response?.status === 409) {
        setError(t("apply.duplicateError"));
      } else {
        setError(msg || "Erro ao enviar candidatura.");
      }
    } finally {
      setLoading(false);
    }
  }

  function formatCpf(value) {
    const d = value.replace(/\D/g, "").slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function handleCpfChange(e) {
    setForm((prev) => ({ ...prev, cpf: formatCpf(e.target.value) }));
  }

  const hasContact =
    contact && (contact.contactEmail || contact.contactPhone || contact.contactLink || contact.applicationLink);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t("apply.title")}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal">
        {/* ── Header ── */}
        <div className="modal-title-row">
          <h2 className="modal-title">{t("apply.title")}</h2>
          <button
            className="a11y-close"
            onClick={onClose}
            aria-label={t("apply.close")}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <p className="modal-desc">
          <strong>{job.title}</strong>
          {!job.companyConfidential && job.company?.name && ` — ${job.company.name}`}
        </p>

        {error && <p className="form-error">{error}</p>}

        {/* ── Step 1: CPF ── */}
        {step === 1 && (
          <form className="apply-step-cpf" onSubmit={handleCheckCpf}>
            <div className="form-group">
              <label htmlFor="apply-cpf">{t("apply.cpfLabel")} *</label>
              <input
                id="apply-cpf"
                name="cpf"
                value={form.cpf}
                onChange={handleCpfChange}
                placeholder={t("apply.cpfPlaceholder")}
                inputMode="numeric"
                autoComplete="off"
                required
              />
              <span className="field-hint">{t("apply.cpfHint")}</span>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>{t("common.cancel")}</button>
              <button type="submit" className="btn btn-primary" disabled={loading || !form.cpf.trim()}>
                {loading ? t("common.loading") : t("apply.checkCpf")}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 2: Dados ── */}
        {step === 2 && (
          <form className="apply-step-form" onSubmit={handleSubmit}>
            {returning && (
              <p className="apply-returning-banner">
                {t("apply.returning").replace("{name}", form.name)}
              </p>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="apply-name">{t("apply.nameLabel")} *</label>
                <input
                  id="apply-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="apply-birth">{t("apply.birthLabel")} *</label>
                <input
                  id="apply-birth"
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="apply-modality">{t("apply.modalityLabel")} *</label>
              <select
                id="apply-modality"
                name="modality"
                value={form.modality}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                {MODALITY_OPTIONS.map((m) => (
                  <option key={m} value={m}>{t(`modality.${m}`)}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="apply-class">{t("apply.classNameLabel")}</label>
                <input
                  id="apply-class"
                  name="className"
                  value={form.className}
                  onChange={handleChange}
                  placeholder="Ex: Técnico em Informática 2024"
                />
              </div>
              <div className="form-group">
                <label htmlFor="apply-year">{t("apply.classYearLabel")}</label>
                <input
                  id="apply-year"
                  name="classYear"
                  value={form.classYear}
                  onChange={handleChange}
                  inputMode="numeric"
                  placeholder="Ex: 2024"
                />
              </div>
            </div>

            <label className="checkbox-label checkbox-label-block">
              <input
                type="checkbox"
                name="lgpdConsent"
                checked={form.lgpdConsent}
                onChange={handleChange}
                required
              />
              <span>{t("apply.lgpd")}</span>
            </label>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setStep(1); setError(""); }}>
                {t("common.cancel")}
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || !form.lgpdConsent}>
                {loading ? t("apply.submitting") : t("apply.submit")}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: Sucesso ── */}
        {step === 3 && (
          <div className="apply-step-success">
            <div className="apply-success-icon" aria-hidden="true">✓</div>
            <h3 className="modal-title" style={{ textAlign: "center", borderBottom: "none", paddingBottom: 0 }}>
              {t("apply.successTitle")}
            </h3>
            {hasContact && (
              <>
                <p className="modal-desc">{t("apply.successDesc")}</p>
                <div className="apply-contact-list">
                  {contact.contactEmail && (
                    <div className="apply-contact-item">
                      <span className="apply-contact-label">{t("apply.contactEmail")}</span>
                      <span className="apply-contact-value">
                        <a href={`mailto:${contact.contactEmail}`}>{contact.contactEmail}</a>
                      </span>
                    </div>
                  )}
                  {contact.contactPhone && (
                    <div className="apply-contact-item">
                      <span className="apply-contact-label">{t("apply.contactPhone")}</span>
                      <span className="apply-contact-value">{contact.contactPhone}</span>
                    </div>
                  )}
                  {(contact.contactLink || contact.applicationLink) && (
                    <div className="apply-contact-item">
                      <span className="apply-contact-label">{t("apply.contactLink")}</span>
                      <span className="apply-contact-value">
                        <a
                          href={contact.contactLink || contact.applicationLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {contact.contactLink || contact.applicationLink}
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
            {!hasContact && (
              <p className="modal-desc" style={{ textAlign: "center" }}>
                Aguarde o contato da empresa.
              </p>
            )}
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button
                className="btn btn-primary"
                onClick={onClose}
              >
                {t("apply.close")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
