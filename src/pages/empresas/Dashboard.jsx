import { Link } from "react-router-dom";
import AreaHeader from "../../components/AreaHeader";
import { useCompanyJobs } from "../../hooks/useCompanyJobs";

const STATUS_LABEL = {
  PENDING: "Aguardando aprovação",
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

const COMPANY_STATUS_OPTIONS = [
  { value: "INACTIVE", label: "Pausar vaga" },
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "COMPLETED", label: "Vaga preenchida" },
];

export default function EmpresaDashboard() {
  const { jobs, loading, updateJobStatus } = useCompanyJobs();

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
                  <th>Atualizar status</th>
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
                    </td>
                    <td>{new Date(job.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                      {["ACTIVE", "IN_PROGRESS", "INACTIVE", "COMPLETED"].includes(job.status) && (
                        <select
                          className="filter-select filter-select-sm"
                          value={job.status}
                          onChange={(e) => updateJobStatus(job.id, e.target.value)}
                        >
                          {COMPANY_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
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
