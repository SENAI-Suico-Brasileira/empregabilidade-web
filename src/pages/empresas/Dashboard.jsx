import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AreaHeader from "../../components/AreaHeader";
import { useCompanyJobs } from "../../hooks/useCompanyJobs";
import { useApp } from "../../context/AppContext";
import { companyService } from "../../services/companyService";


const STATUS_LABEL = {
  PENDING: "Aguardando aprovação",
  ACTIVE: "Ativa",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Preenchida",
  INACTIVE: "Pausada",
  REJECTED: "Reprovada",
};

const STATUS_BADGE_CLASS = {
  PENDING: "badge-pending",
  ACTIVE: "badge-active",
  IN_PROGRESS: "badge-progress",
  COMPLETED: "badge-completed",
  INACTIVE: "badge-inactive",
  REJECTED: "badge-rejected",
};

// Status disponíveis para seleção manual pela empresa (não inclui COMPLETED — tem modal próprio)
const STATUS_OPTIONS = [
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "INACTIVE", label: "Pausar vaga" },
  { value: "COMPLETED", label: "Vaga preenchida" },
];

const DATE_LOCALE = { "pt-BR": "pt-BR", en: "en-US", es: "es-ES" };
const MODALITY_LABEL = {
  FIC:           "FIC",
  TECNICO:       "Técnico",
  CAI:           "CAI",
  SUPERIOR:      "Superior",
  POS_GRADUACAO: "Pós-Grad.",
  EGRESSO:       "Egresso",
};

export default function EmpresaDashboard() {
  const { t, lang } = useApp();
  const { jobs, loading, updateJobStatus } = useCompanyJobs();

  const dateLocale = DATE_LOCALE[lang] || "pt-BR";

  const [pendingAction, setPendingAction] = useState(null);

  // Campos dos modais
  const [filledBy, setFilledBy] = useState("");
  const [filledStudentName, setFilledStudentName] = useState("");
  const [pauseReason, setPauseReason] = useState("");
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  // Painel de candidatos
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [applicants, setApplicants] = useState({});
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  async function toggleApplicants(jobId) {
    if (expandedJobId === jobId) { setExpandedJobId(null); return; }
    setExpandedJobId(jobId);
    if (applicants[jobId]) return; // já carregado
    setLoadingApplicants(true);
    try {
      const data = await companyService.listApplicants(jobId);
      setApplicants((prev) => ({ ...prev, [jobId]: data }));
    } catch { /* silencioso */ }
    finally { setLoadingApplicants(false); }
  }

  function handleStatusSelect(jobId, status) {
    setModalError("");

    if (status === "COMPLETED") {
      setFilledBy("");
      setFilledStudentName("");
      setPendingAction({ jobId, status });
      return;
    }
    if (status === "INACTIVE") {
      setPauseReason("");
      setPendingAction({ jobId, status });
      return;
    }
    updateJobStatus(jobId, status);
  }

  async function confirmModal() {
    setModalError("");

    if (pendingAction.status === "COMPLETED" && !filledBy) {
      setModalError("Selecione se a vaga foi preenchida por aluno do SENAI ou outro.");
      return;
    }
    if (pendingAction.status === "INACTIVE" && !pauseReason.trim()) {
      setModalError("Informe o motivo da pausa.");
      return;
    }

    setSaving(true);
    try {
      const extraData =
        pendingAction.status === "COMPLETED"
          ? { filledBy, filledStudentName: filledBy === "SENAI_STUDENT" ? filledStudentName : undefined }
          : { pauseReason };

      await updateJobStatus(pendingAction.jobId, pendingAction.status, extraData);
      setPendingAction(null);
    } catch (err) {
      setModalError(err.response?.data?.message || "Erro ao atualizar status.");
    } finally {
      setSaving(false);
    }
  }

  function cancelModal() {
    setPendingAction(null);
    setModalError("");
  }

  return (
    <>
      <AreaHeader areaName="Painel da Empresa" homeHref="/empresas" />
      <main className="area-main">
        <div className="page">
          <div className="section-header">
            <h2 className="section-title">Minhas Vagas</h2>
            <Link to="/empresas/vagas/nova" className="btn btn-primary">+ Nova Vaga</Link>
          </div>

          <div className="info-banner">
            Vagas criadas ficam em <strong>Aguardando aprovação</strong> até serem revisadas pela equipe SENAI.
          </div>

          {loading ? (
            <p className="loading">Carregando...</p>
          ) : jobs.length === 0 ? (
            <p className="empty">
              Nenhuma vaga cadastrada ainda.{" "}
              <Link to="/empresas/vagas/nova">Cadastre a primeira!</Link>
            </p>
          ) : (
            <div className="table-wrap">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Cargo</th>
                  <th className="col-hide-sm">Categoria</th>
                  <th>Status</th>
                  <th className="col-hide-sm">Cadastrada em</th>
                  <th>Atualizar</th>
                  <th>{t("applicants.title")}</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <>
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td className="col-hide-sm">
                        {job.category?.slug
                          ? t(`category.${job.category.slug}`)
                          : job.category?.name}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE_CLASS[job.status]}`}>
                          {STATUS_LABEL[job.status]}
                        </span>
                        {job.status === "REJECTED" && job.rejectionReason && (
                          <span className="rejection-reason" title={job.rejectionReason}> — ver motivo</span>
                        )}
                        {job.status === "INACTIVE" && job.pauseReason && (
                          <span className="rejection-reason" title={job.pauseReason}> — ver motivo</span>
                        )}
                      </td>
                      <td>{new Date(job.createdAt).toLocaleDateString(dateLocale)}</td>
                      <td>
                        {["ACTIVE", "IN_PROGRESS", "INACTIVE"].includes(job.status) && (
                          <select
                            className="filter-select filter-select-sm"
                            value={job.status}
                            onChange={(e) => handleStatusSelect(job.id, e.target.value)}
                          >
                            <option value={job.status} disabled>
                              {STATUS_LABEL[job.status]}
                            </option>
                            {STATUS_OPTIONS.filter((o) => o.value !== job.status).map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        )}
                        {job.status === "COMPLETED" && (
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
                        <td colSpan={6} style={{ padding: "0.5rem 1rem 1rem" }}>
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
                                    <th>{t("applicants.modality")}</th>
                                    <th>{t("applicants.className")}</th>
                                    <th>{t("applicants.date")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {applicants[job.id].map((app) => (
                                    <tr key={app.id}>
                                      <td>{app.applicant.name}</td>
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
            </div>
          )}
        </div>
      </main>

      {/* ── Modal: vaga preenchida ── */}
      {pendingAction?.status === "COMPLETED" && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Confirmar vaga preenchida</h3>
            <p className="modal-desc">
              Parabéns pela contratação! Para fins de acompanhamento do SENAI, informe a origem do candidato selecionado.
              Essa informação é obrigatória e não poderá ser alterada depois.
            </p>

            {modalError && <p className="form-error">{modalError}</p>}

            <div className="modal-radio-group">
              <label className="modal-radio-option">
                <input
                  type="radio"
                  name="filledBy"
                  value="SENAI_STUDENT"
                  checked={filledBy === "SENAI_STUDENT"}
                  onChange={() => setFilledBy("SENAI_STUDENT")}
                />
                <div>
                  <div>Aluno ou egresso do SENAI</div>
                  <div className="modal-radio-sublabel">O candidato contratado estudou no SENAI</div>
                </div>
              </label>
              <label className="modal-radio-option">
                <input
                  type="radio"
                  name="filledBy"
                  value="OTHER"
                  checked={filledBy === "OTHER"}
                  onChange={() => setFilledBy("OTHER")}
                />
                <div>
                  <div>Outro candidato</div>
                  <div className="modal-radio-sublabel">O candidato veio de outra origem</div>
                </div>
              </label>
            </div>

            {filledBy === "SENAI_STUDENT" && (
              <div className="form-group">
                <label>Nome do aluno SENAI contratado (opcional)</label>
                <input
                  placeholder="Ex: João Silva"
                  value={filledStudentName}
                  onChange={(e) => setFilledStudentName(e.target.value)}
                />
                <span className="field-hint">Se informado, aparecerá nos indicadores do painel.</span>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={cancelModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmModal} disabled={saving}>
                {saving ? "Salvando..." : "Confirmar preenchimento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: pausar vaga ── */}
      {pendingAction?.status === "INACTIVE" && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Pausar vaga</h3>
            <p className="modal-desc">Informe o motivo da pausa.</p>

            {modalError && <p className="form-error">{modalError}</p>}

            <div className="form-group">
              <textarea
                className="modal-textarea"
                rows={3}
                placeholder="Ex: processo seletivo em andamento internamente..."
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={cancelModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmModal} disabled={saving}>
                {saving ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
