import { useApp } from "../context/AppContext";

const CONTRACT_TYPE_KEY = {
  CLT:        "contract.CLT",
  APPRENTICE: "contract.APPRENTICE",
  INTERNSHIP: "contract.INTERNSHIP",
  PJ:         "contract.PJ",
  OTHER:      "contract.OTHER",
};

export default function JobCard({ job }) {
  const { t } = useApp();

  const contractLabel = t(CONTRACT_TYPE_KEY[job.contractType] ?? "contract.OTHER") || null;

  const companyDisplay = job.companyConfidential
    ? t("mural.confidential")
    : job.company?.name;

  const salary = formatSalary(job, t);

  const deadline = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString("pt-BR")
    : null;

  const applicationHref = job.applicationLink?.startsWith("http")
    ? job.applicationLink
    : `mailto:${job.applicationLink}`;

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
            : `${t("mural.published")} ${new Date(job.createdAt).toLocaleDateString("pt-BR")}`
          }
        </span>
        {job.applicationLink && (
          <a
            href={applicationHref}
            className="btn btn-primary btn-sm"
            target="_blank"
            rel="noreferrer"
            aria-label={`${t("mural.apply")} — ${job.title}`}
          >
            {t("mural.apply")}
          </a>
        )}
      </div>
    </article>
  );
}

function formatSalary(job, t) {
  if (job.salaryType === "NEGOTIABLE") return t("job.salary.negotiable");
  if (job.salaryType === "RANGE" && job.salaryMin && job.salaryMax)
    return `${job.salaryMin} a ${job.salaryMax}`;
  if (job.salaryMin) return job.salaryMin;
  return null;
}
