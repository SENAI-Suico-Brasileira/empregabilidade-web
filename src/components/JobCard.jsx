import { useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../context/AppContext";
import ApplyModal from "./ApplyModal";

const CONTRACT_TYPE_KEY = {
  CLT:        "contract.CLT",
  APPRENTICE: "contract.APPRENTICE",
  INTERNSHIP: "contract.INTERNSHIP",
  PJ:         "contract.PJ",
  OTHER:      "contract.OTHER",
};

const DATE_LOCALE = { "pt-BR": "pt-BR", en: "en-US", es: "es-ES" };

export default function JobCard({ job, onApply }) {
  const { t, lang } = useApp();
  const [showApply, setShowApply] = useState(false);
  const dateLocale = DATE_LOCALE[lang] || "pt-BR";

  const contractLabel = t(CONTRACT_TYPE_KEY[job.contractType] ?? "contract.OTHER") || null;

  const companyDisplay = job.companyConfidential
    ? t("mural.confidential")
    : job.company?.name;

  const salary = formatSalary(job, t);

  const deadline = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString(dateLocale)
    : null;

  return (
    <article className="job-card">
      <div className="job-card-header">
        <span className="job-category">
          {job.category?.slug ? t(`category.${job.category.slug}`) : job.category?.name}
        </span>
        {salary && <span className="job-salary">{salary}</span>}
      </div>

      <h2 className="job-title">{job.title}</h2>

      <div className="job-card-meta">
        <p className="job-company">{companyDisplay}</p>
        {contractLabel && <span className="job-contract-badge">{contractLabel}</span>}
      </div>

      {job.workLocation && <p className="job-meta">{job.workLocation}</p>}
      {job.workSchedule && <p className="job-meta">{job.workSchedule}</p>}

      {job.company?.description && (
        <p className="job-section-text">{job.company.description}</p>
      )}

      {job.responsibilities && (
        <div className="job-section">
          <strong>{t("job.responsibilities")}</strong>
          <p>{job.responsibilities}</p>
        </div>
      )}

      {job.requiredQualifications && (
        <div className="job-section">
          <strong>{t("job.required")}</strong>
          <p>{job.requiredQualifications}</p>
        </div>
      )}

      {job.desiredQualifications && (
        <div className="job-section">
          <strong>{t("job.desired")}</strong>
          <p>{job.desiredQualifications}</p>
        </div>
      )}

      {job.benefits && (
        <div className="job-section">
          <strong>{t("job.benefits")}</strong>
          <p>{job.benefits}</p>
        </div>
      )}

      <div className="job-card-footer">
        <span className="job-date">
          {deadline
            ? `${t("mural.deadline")} ${deadline}`
            : `${t("mural.published")} ${new Date(job.createdAt).toLocaleDateString(dateLocale)}`
          }
        </span>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowApply(true)}
          aria-label={`${t("mural.apply")} — ${job.title}`}
        >
          {t("mural.apply")}
        </button>
      </div>

    </article>

    {/* Renderiza fora da árvore do card para evitar overflow/z-index */}
    {showApply && createPortal(
      <ApplyModal job={job} onClose={() => setShowApply(false)} />,
      document.body
    )}
  );
}

function formatSalary(job, t) {
  if (job.salaryType === "NEGOTIABLE") return t("job.salary.negotiable");
  if (job.salaryType === "RANGE" && job.salaryMin && job.salaryMax)
    return `${job.salaryMin} a ${job.salaryMax}`;
  if (job.salaryMin) return job.salaryMin;
  return null;
}
