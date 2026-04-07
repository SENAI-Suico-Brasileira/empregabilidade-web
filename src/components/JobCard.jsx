const CONTRACT_TYPE_LABEL = {
  CLT: "CLT",
  APPRENTICE: "Aprendiz",
  INTERNSHIP: "Estágio",
  PJ: "PJ",
  OTHER: null, // não exibe quando não informado
};

function formatSalary(job) {
  if (job.salaryType === "NEGOTIABLE") return "À combinar";
  if (job.salaryType === "RANGE" && job.salaryMin && job.salaryMax)
    return `${job.salaryMin} a ${job.salaryMax}`;
  if (job.salaryMin) return job.salaryMin;
  return null;
}

export default function JobCard({ job }) {
  const salary = formatSalary(job);
  const contractLabel = CONTRACT_TYPE_LABEL[job.contractType] ?? null;
  const companyDisplay = job.companyConfidential ? "Empresa Confidencial" : job.company?.name;
  const deadline = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString("pt-BR")
    : null;

  return (
    <div className="job-card">
      <div className="job-card-header">
        <span className="job-category">{job.category?.name}</span>
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
          <strong>Responsabilidades</strong>
          <p>{job.responsibilities}</p>
        </div>
      )}

      {job.requiredQualifications && (
        <div className="job-section">
          <strong>Requisitos obrigatórios</strong>
          <p>{job.requiredQualifications}</p>
        </div>
      )}

      {job.desiredQualifications && (
        <div className="job-section">
          <strong>Requisitos desejáveis</strong>
          <p>{job.desiredQualifications}</p>
        </div>
      )}

      {job.benefits && (
        <div className="job-section">
          <strong>Benefícios</strong>
          <p>{job.benefits}</p>
        </div>
      )}

      <div className="job-card-footer">
        <span className="job-date">
          {deadline ? `Inscrições até ${deadline}` : `Publicado em ${new Date(job.createdAt).toLocaleDateString("pt-BR")}`}
        </span>
        {job.applicationLink && (
          <a
            href={job.applicationLink.startsWith("http") ? job.applicationLink : `mailto:${job.applicationLink}`}
            className="btn btn-primary btn-sm"
            target="_blank"
            rel="noreferrer"
          >
            Candidatar-se
          </a>
        )}
      </div>
    </div>
  );
}
