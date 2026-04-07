import { useState } from "react";
import AreaHeader from "../../components/AreaHeader";
import RejectModal from "../../components/RejectModal";
import { useAdmVagas } from "../../hooks/useAdmVagas";
import { useApp } from "../../context/AppContext";

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

export default function AdmVagasPage() {
  const { t } = useApp();
  const { jobs, loading, statusFilter, setStatusFilter, approveJob, rejectJob } = useAdmVagas();
  const [rejectTarget, setRejectTarget] = useState(null); // id da vaga sendo reprovada
  const [saving, setSaving] = useState(false);

  async function handleConfirmReject(reason) {
    setSaving(true);
    await rejectJob(rejectTarget, reason);
    setSaving(false);
    setRejectTarget(null);
  }

  return (
    <>
      <AreaHeader areaName="Gestão de Vagas" homeHref="/adm" />
      <main id="main-content" className="area-main">
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
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
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
                    <td>{new Date(job.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="table-actions">
                      {job.status === "PENDING" && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => approveJob(job.id)}
                          >
                            Aprovar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => setRejectTarget(job.id)}
                          >
                            Reprovar
                          </button>
                        </>
                      )}
                      {job.status === "REJECTED" && job.rejectionReason && (
                        <span
                          className="rejection-reason"
                          title={job.rejectionReason}
                          tabIndex={0}
                          aria-label={`Motivo: ${job.rejectionReason}`}
                        >
                          ver motivo
                        </span>
                      )}
                      {job.status === "INACTIVE" && job.pauseReason && (
                        <span
                          className="rejection-reason"
                          title={job.pauseReason}
                          tabIndex={0}
                          aria-label={`Motivo da pausa: ${job.pauseReason}`}
                        >
                          ver motivo
                        </span>
                      )}
                      {job.status === "COMPLETED" && job.filledBy && (
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

      {rejectTarget && (
        <RejectModal
          onConfirm={handleConfirmReject}
          onCancel={() => setRejectTarget(null)}
          saving={saving}
        />
      )}
    </>
  );
}
