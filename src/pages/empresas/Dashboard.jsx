import { useState } from "react";
import { Link } from "react-router-dom";
import AreaHeader from "../../components/AreaHeader";
import { useCompanyJobs } from "../../hooks/useCompanyJobs";

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

export default function EmpresaDashboard() {
  const { jobs, loading, updateJobStatus } = useCompanyJobs();

  // pendingAction guarda a mudança em espera antes de abrir o modal
  const [pendingAction, setPendingAction] = useState(null);
  // { jobId, status } — preenchido antes de abrir o modal correspondente

  // Campos dos modais
  const [filledBy, setFilledBy] = useState("");
  const [pauseReason, setPauseReason] = useState("");
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleStatusSelect(jobId, status) {
    setModalError("");

    if (status === "COMPLETED") {
      setFilledBy("");
      setPendingAction({ jobId, status });
      return;
    }
    if (status === "INACTIVE") {
      setPauseReason("");
      setPendingAction({ jobId, status });
      return;
    }
    // IN_PROGRESS não precisa de dados extras
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
          ? { filledBy }
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
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Cargo</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Cadastrada em</th>
                  <th>Atualizar</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.category?.name}</td>
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
                    <td>{new Date(job.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                      {/* COMPLETED é terminal — sem controles */}
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
                          {job.filledBy === "SENAI_STUDENT" ? "Aluno SENAI" : "Outro candidato"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ── Modal: vaga preenchida ── */}
      {pendingAction?.status === "COMPLETED" && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Vaga preenchida</h3>
            <p className="modal-desc">
              O candidato contratado é aluno ou egresso do SENAI?
            </p>

            {modalError && <p className="form-error">{modalError}</p>}

            <div className="modal-radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="filledBy"
                  value="SENAI_STUDENT"
                  checked={filledBy === "SENAI_STUDENT"}
                  onChange={() => setFilledBy("SENAI_STUDENT")}
                />
                Sim, é aluno ou egresso do SENAI
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="filledBy"
                  value="OTHER"
                  checked={filledBy === "OTHER"}
                  onChange={() => setFilledBy("OTHER")}
                />
                Não, é outro candidato
              </label>
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
