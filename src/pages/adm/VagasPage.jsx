import AreaHeader from "../../components/AreaHeader";
import { useAdmVagas } from "../../hooks/useAdmVagas";

const STATUS_LABEL = {
  PENDING: "Pendente",
  ACTIVE: "Ativa",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  INACTIVE: "Inativa",
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

export default function AdmVagasPage() {
  const { jobs, loading, statusFilter, setStatusFilter, approveJob, rejectJob } = useAdmVagas();

  async function handleReject(id) {
    const reason = prompt("Motivo da reprovação (opcional):");
    await rejectJob(id, reason);
  }

  return (
    <>
      <AreaHeader areaName="Gestão de Vagas" homeHref="/adm" />
      <main className="area-main">
        <div className="page">
          <div className="section-header">
            <h2 className="section-title">Todas as Vagas</h2>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="loading">Carregando...</p>
          ) : (
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Cargo</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.company?.name}</td>
                    <td>{job.title}</td>
                    <td>{job.category?.name}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE_CLASS[job.status]}`}>
                        {STATUS_LABEL[job.status]}
                      </span>
                    </td>
                    <td>{new Date(job.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="table-actions">
                      {job.status === "PENDING" && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => approveJob(job.id)}>
                            Aprovar
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleReject(job.id)}>
                            Reprovar
                          </button>
                        </>
                      )}
                      {job.status === "REJECTED" && job.rejectionReason && (
                        <span className="rejection-reason" title={job.rejectionReason}>ver motivo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
