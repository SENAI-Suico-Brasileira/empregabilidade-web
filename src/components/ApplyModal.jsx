import { useState } from "react";
import { createPortal } from "react-dom";
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

const SEMESTER_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8"];

const INITIAL_FORM = {
  cpf:             "",
  name:            "",
  birthDate:       "",
  modality:        "",
  className:       "",
  classYear:       "",
  classSemester:   "",
  courseCompleted: false,
  lgpdConsent:     false,
};

export default function ApplyModal({ job, onClose }) {
  const { t } = useApp();
  const [step, setStep]                     = useState(1);
  const [form, setForm]                     = useState(INITIAL_FORM);
  const [returning, setReturning]           = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [contact, setContact]               = useState(null);
  const [error, setError]                   = useState("");
  const [loading, setLoading]               = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "modality" && value === "EGRESSO") {
        next.classSemester   = "";
        next.courseCompleted = true;
      }
      if (name === "modality" && prev.modality === "EGRESSO" && value !== "EGRESSO") {
        next.courseCompleted = false;
      }
      if (name === "courseCompleted" && checked) {
        next.classSemester = "";
      }
      return next;
    });
  }

  function handleCpfChange(e) {
    const d = e.target.value.replace(/\D/g, "").slice(0, 11);
    const masked = d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setForm((prev) => ({ ...prev, cpf: masked }));
  }

  async function handleCheckCpf(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await jobsService.checkCpf(job.id, form.cpf);
      if (result.alreadyApplied) {
        setAlreadyApplied(true);
        setStep(2);
        return;
      }
      if (result.found) {
        setForm((prev) => ({
          ...prev,
          name:            result.name            || "",
          birthDate:       result.birthDate ? result.birthDate.split("T")[0] : "",
          modality:        result.modality         || "",
          className:       result.className        || "",
          classYear:       result.classYear   ? String(result.classYear)  : "",
          classSemester:   result.classSemester    || "",
          courseCompleted: Boolean(result.courseCompleted),
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.lgpdConsent) { setError(t("apply.lgpd")); return; }
    setError("");
    setLoading(true);
    try {
      const result = await jobsService.apply(job.id, {
        cpf:             form.cpf,
        name:            form.name,
        birthDate:       form.birthDate,
        modality:        form.modality,
        className:       form.className       || undefined,
        classYear:       form.classYear       || undefined,
        classSemester:   form.classSemester   || undefined,
        courseCompleted: form.courseCompleted,
        lgpdConsent:     true,
      });
      setContact(result);
      setStep(3);
    } catch (err) {
      if (err.response?.status === 409) {
        setError(t("apply.duplicateError"));
      } else {
        setError(err.response?.data?.message || "Erro ao enviar candidatura.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isEgresso    = form.modality === "EGRESSO";
  const showSemester = form.modality && !isEgresso && !form.courseCompleted;
  const hasContact   = contact &&
    (contact.contactEmail || contact.contactPhone || contact.contactLink || contact.applicationLink);

  const modal = (
    <div
      className="modal-overlay apply-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t("apply.title")}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal apply-modal">

        {/* Header */}
        <div className="modal-title-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="modal-title">{t("apply.title")}</h2>
            <p className="modal-desc" style={{ marginTop: "0.2rem", paddingBottom: 0 }}>
              <strong>{job.title}</strong>
              {!job.companyConfidential && job.company?.name && ` — ${job.company.name}`}
            </p>
          </div>
          <button className="a11y-close" onClick={onClose} aria-label={t("apply.close")}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Stepper */}
        {!alreadyApplied && step < 3 && (
          <div className="apply-steps" aria-hidden="true">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`apply-step-dot${step >= s ? " active" : ""}`} />
            ))}
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        {/* ── Step 1: CPF ── */}
        {step === 1 && (
          <form className="apply-step-cpf" onSubmit={handleCheckCpf} noValidate>
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
                autoFocus
              />
              <span className="field-hint">{t("apply.cpfHint")}</span>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || form.cpf.replace(/\D/g, "").length < 11}
              >
                {loading ? t("common.loading") : t("apply.checkCpf")}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 2a: já se candidatou (bloqueio) ── */}
        {step === 2 && alreadyApplied && (
          <div className="apply-step-cpf">
            <div className="apply-already-banner">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.75"/>
                <path d="M10 5.5v5M10 13.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{t("apply.duplicateError")}</span>
            </div>
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={onClose}>{t("apply.close")}</button>
            </div>
          </div>
        )}

        {/* ── Step 2b: formulário ── */}
        {step === 2 && !alreadyApplied && (
          <form className="apply-step-form" onSubmit={handleSubmit} noValidate>
            {returning && (
              <p className="apply-returning-banner">
                {t("apply.returning").replace("{name}", form.name)}
              </p>
            )}

            {/* Dados pessoais */}
            <div className="apply-fieldset">
              <span className="apply-fieldset-label">{t("apply.sectionPersonal")}</span>
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
            </div>

            {/* Dados acadêmicos */}
            <div className="apply-fieldset">
              <span className="apply-fieldset-label">{t("apply.sectionAcademic")}</span>

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

              {form.modality && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="apply-class">{t("apply.classNameLabel")}</label>
                      <input
                        id="apply-class"
                        name="className"
                        value={form.className}
                        onChange={handleChange}
                        placeholder="Ex: Técnico em Informática"
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
                        placeholder={isEgresso ? "Ano de conclusão" : "Ano de ingresso"}
                      />
                    </div>
                  </div>

                  {showSemester && (
                    <div className="form-group">
                      <label htmlFor="apply-semester">{t("apply.semesterLabel")}</label>
                      <select
                        id="apply-semester"
                        name="classSemester"
                        value={form.classSemester}
                        onChange={handleChange}
                      >
                        <option value="">Selecione o semestre atual...</option>
                        {SEMESTER_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}º semestre</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!isEgresso && (
                    <label className="checkbox-label" style={{ marginTop: "0.15rem" }}>
                      <input
                        type="checkbox"
                        name="courseCompleted"
                        checked={form.courseCompleted}
                        onChange={handleChange}
                      />
                      <span>{t("apply.courseCompleted")}</span>
                    </label>
                  )}
                </>
              )}
            </div>

            {/* LGPD */}
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
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setStep(1); setError(""); setReturning(false); }}
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !form.lgpdConsent || !form.name || !form.birthDate || !form.modality}
              >
                {loading ? t("apply.submitting") : t("apply.submit")}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: Sucesso ── */}
        {step === 3 && (
          <div className="apply-step-success">
            <div className="apply-success-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" fill="#dcfce7" stroke="#16a34a" strokeWidth="2"/>
                <path d="M9 16l5 5 9-9" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 style={{ textAlign: "center", fontSize: "1.05rem", fontWeight: 700 }}>
              {t("apply.successTitle")}
            </h3>

            {hasContact ? (
              <>
                <p className="modal-desc" style={{ textAlign: "center" }}>
                  {t("apply.successDesc")}
                </p>
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
            ) : (
              <p className="modal-desc" style={{ textAlign: "center" }}>
                {t("apply.successNoContact")}
              </p>
            )}

            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={onClose}>
                {t("apply.close")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
