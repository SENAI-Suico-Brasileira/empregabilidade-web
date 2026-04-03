import { Link } from "react-router-dom";
import AreaHeader from "../../components/AreaHeader";
import { useAdmDashboard } from "../../hooks/useAdmDashboard";

export default function AdmDashboard() {
  const { indicators, pendingJobs, loading, approveJob, rejectJob } = useAdmDashboard();

  async function handleReject(id) {
    const reason = prompt("Motivo da reprovação (opcional):");
    await rejectJob(id, reason);
  }

  if (loading) {
    return (
      <>
        <AreaHeader areaName="Painel Admin" homeHref="/adm" />
        <p className="loading">Carregando...</p>
      </>
    );
  }

  return (
    <>
      <AreaHeader areaName="Painel Administrativo" homeHref="/adm" />

      <main className="area-main">
        <div className="page">
          {/* ── Indicadores ── */}
          <section>
            <h2 className="section-title">Visão Geral</h2>
            <div className="indicators-grid">
              <div className="indicator-card indicator-pending">
                <span className="indicator-value">{indicators?.jobsByStatus?.PENDING ?? 0}</span>
                <span className="indicator-label">Aguardando aprovação</span>
              </div>
              <div className="indicator-card indicator-active">
                <span className="indicator-value">{indicators?.jobsByStatus?.ACTIVE ?? 0}</span>
                <span className="indicator-label">Vagas ativas no mural</span>
              </div>
              <div className="indicator-card">
                <span className="indicator-value">{indicators?.totalCompanies ?? 0}</span>
                <span className="indicator-label">Empresas cadastradas</span>
              </div>
            </div>
          </section>

          {/* ── Vagas por categoria ── */}
          {indicators?.jobsByCategory?.length > 0 && (
            <section>
              <h2 className="section-title">Vagas Ativas por Categoria</h2>
              <div className="category-stats">
                {indicators.jobsByCategory.map((cat) => (
                  <div key={cat.categoryName} className="category-stat-row">
                    <span>{cat.categoryName}</span>
                    <div className="category-stat-bar-wrap">
                      <div
                        className="category-stat-bar"
                        style={{
                          width: `${Math.min(100, (cat.count / (indicators.jobsByStatus.ACTIVE || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="category-stat-count">{cat.count}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Fila de aprovação ── */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Vagas Pendentes de Aprovação</h2>
              <Link to="/adm/vagas" className="btn btn-outline btn-sm">Ver todas as vagas</Link>
            </div>

            {pendingJobs.length === 0 ? (
              <p className="empty">Nenhuma vaga aguardando aprovação.</p>
            ) : (
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Cargo</th>
                    <th>Categoria</th>
                    <th>Enviada em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingJobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.company?.name}</td>
                      <td>{job.title}</td>
                      <td>{job.category?.name}</td>
                      <td>{new Date(job.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className="table-actions">
                        <button className="btn btn-sm btn-success" onClick={() => approveJob(job.id)}>
                          Aprovar
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleReject(job.id)}>
                          Reprovar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
