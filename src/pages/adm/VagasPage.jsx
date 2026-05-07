import { useState } from "react";
import RejectModal from "../../components/RejectModal";
import { useAdmVagas } from "../../hooks/useAdmVagas";
import { useApp } from "../../context/AppContext";
import { admService } from "../../services/admService";

const STATUS_LABEL = {
  PENDING:     "Pendente",
  ACTIVE:      "Ativa",
  IN_PROGRESS: "Em andamento",
  COMPLETED:   "Concluída",
  INACTIVE:    "Pausada",
  REJECTED:    "Reprovada",
};

const STATUS_BADGE_CLASS = {
  PENDING:     "badge-pending",
  ACTIVE:      "badge-active",
  IN_PROGRESS: "badge-progress",
  COMPLETED:   "badge-completed",
  INACTIVE:    "badge-inactive",
  REJECTED:    "badge-rejected",
};

const DATE_LOCALE = { "pt-BR": "pt-BR", en: "en-US", es: "es-ES" };

function formatCpf(cpf) {
  const d = String(cpf).replace(/\D/g, "").padStart(11, "0");
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}`;
}
const MODALITY_LABEL = {
  FIC: "FIC", TECNICO: "Técnico", CAI: "CAI",
  SUPERIOR: "Superior", POS_GRADUACAO: "Pós-Grad.", EGRESSO: "Egresso",
};

export default function AdmVagasPage() {
  const { t, lang } = useApp();
  const { jobs, loading, statusFilter, setStatusFilter, approveJob, rejectJob } = useAdmVagas();
  const dateLocale = DATE_LOCALE[lang] || "pt-BR";

  const [rejectTarget, setRejectTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // Painel de candidatos
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [applicants, setApplicants] = useState({});
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  async function toggleApplicants(jobId) {
    if (expandedJobId === jobId) { setExpandedJobId(null); return; }
    setExpandedJobId(jobId);
    if (applicants[jobId]) return;
    setLoadingApplicants(true);
    try {
      const data = await admService.listApplicants(jobId);
      setApplicants((prev) => ({ ...prev, [jobId]: data }));
    } catch { /* silencioso */ }
    finally { setLoadingApplicants(false); }
  }

  async function handleConfirmReject(reason) {
    setSaving(true);
    await rejectJob(rejectTarget, reason);
    setSaving(false);
    setRejectTarget(null);
  }

  return (
    <div className="adm-page">
      <div className="page">
          <div className="section-header">
            <h2 className="section-title">Todas as Vagas</h2>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrar por status"
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="loading" role="status">Carregando...</p>
          ) : jobs.length === 0 ? (
            <p className="empty">Nenhuma vaga encontrada.</p>
          ) : (
            <table className="jobs-table">
              <thead>
                <tr>
                  <th scope="col">Empresa</th>
                  <th scope="col">Cargo</th>
                  <th scope="col">Categoria</th>
                  <th scope="col">Status</th>
                  <th scope="col">Data</th>
                  <th scope="col">Ações</th>
                  <th scope="col">{t("applicants.title")}</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <>
                    <tr key={job.id}>
                      <td>{job.company?.name}</td>
                      <td>{job.title}</td>
                      <td>
                        {job.category?.slug
                          ? t(`category.${job.category.slug}`)
                          : job.category?.name}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE_CLASS[job.status]}`}>
                          {STATUS_LABEL[job.status]}
                        </span>
                      </td>
                      <td>{new Date(job.createdAt).toLocaleDateString(dateLocale)}</td>
                      <td className="table-actions">
                        {job.status === "PENDING" && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => approveJob(job.id)}>
                              {t("common.approve")}
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => setRejectTarget(job.id)}>
                              {t("common.reject")}
                            </button>
                          </>
                        )}
                        {job.status === "REJECTED" && job.rejectionReason && (
                          <span className="rejection-reason" title={job.rejectionReason} tabIndex={0}>
                            {t("common.viewReason")}
                          </span>
                        )}
                        {job.status === "INACTIVE" && job.pauseReason && (
                          <span className="rejection-reason" title={job.pauseReason} tabIndex={0}>
                            {t("common.viewReason")}
                          </span>
                        )}
                        {job.status === "COMPLETED" && job.filledBy && (
                          <span className="status-final">
                            {job.filledBy === "SENAI_STUDENT"
                              ? job.filledStudentName
                                ? `Aluno SENAI — ${job.filledStudentName}`
                                : "Aluno SENAI"
                              : "Outro candidato"}
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="expand-btn"
                          onClick={() => toggleApplicants(job.id)}
                          aria-expanded={expandedJobId === job.id}
                        >
                          {expandedJobId === job.id ? "▲ Fechar" : "▼ Ver"}
                        </button>
                      </td>
                    </tr>
                    {expandedJobId === job.id && (
                      <tr key={`${job.id}-applicants`}>
                        <td colSpan={7} style={{ padding: "0.5rem 1rem 1rem" }}>
                          {loadingApplicants && !applicants[job.id] ? (
                            <p className="loading" style={{ padding: "1rem 0" }}>{t("common.loading")}</p>
                          ) : (applicants[job.id] || []).length === 0 ? (
                            <p className="applicants-empty">{t("applicants.empty")}</p>
                          ) : (
                            <div className="applicants-panel">
                              <div className="applicants-panel-header">
                                <span className="applicants-panel-title">{t("applicants.title")}</span>
                                <span className="applicants-count">{applicants[job.id].length} candidato(s)</span>
                              </div>
                              <table className="applicants-table">
                                <thead>
                                  <tr>
                                    <th>{t("applicants.name")}</th>
                                    <th>CPF</th>
                                    <th>{t("applicants.modality")}</th>
                                    <th>{t("applicants.className")}</th>
                                    <th>{t("applicants.date")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {applicants[job.id].map((app) => (
                                    <tr key={app.id}>
                                      <td>{app.applicant.name}</td>
                                      <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                        {formatCpf(app.applicant.cpf)}
                                      </td>
                                      <td>{MODALITY_LABEL[app.applicant.modality] || app.applicant.modality}</td>
                                      <td>{app.applicant.className || "—"}{app.applicant.classYear ? ` (${app.applicant.classYear})` : ""}</td>
                                      <td>{new Date(app.createdAt).toLocaleDateString(dateLocale)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>

      {rejectTarget && (
        <RejectModal
          onConfirm={handleConfirmReject}
          onCancel={() => setRejectTarget(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
