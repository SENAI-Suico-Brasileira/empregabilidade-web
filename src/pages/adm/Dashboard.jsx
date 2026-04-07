import { Link } from "react-router-dom";
import AreaHeader from "../../components/AreaHeader";
import { useAdmDashboard } from "../../hooks/useAdmDashboard";

const CONTRACT_TYPE_LABEL = {
  CLT: "CLT",
  APPRENTICE: "Jovem Aprendiz",
  INTERNSHIP: "Estágio",
  PJ: "PJ",
  OTHER: "Outro",
};

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

  const totalFilled = (indicators?.filledBySenai ?? 0) + (indicators?.filledByOther ?? 0);
  const senaiRate = totalFilled > 0
    ? Math.round((indicators.filledBySenai / totalFilled) * 100)
    : null;

  return (
    <>
      <AreaHeader areaName="Painel Administrativo" homeHref="/adm" />

      <main className="area-main">
        <div className="page">

          {/* ── Indicadores principais ── */}
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
              <div className="indicator-card">
                <span className="indicator-value">{indicators?.companiesWithActiveJobs ?? 0}</span>
                <span className="indicator-label">Empresas com vagas ativas</span>
              </div>
              <div className="indicator-card">
                <span className="indicator-value">{indicators?.jobsByStatus?.COMPLETED ?? 0}</span>
                <span className="indicator-label">Vagas preenchidas</span>
              </div>
              <div className="indicator-card">
                <span className="indicator-value">{indicators?.jobsByStatus?.IN_PROGRESS ?? 0}</span>
                <span className="indicator-label">Seleções em andamento</span>
              </div>
            </div>
          </section>

          {/* ── Preenchimento por origem do candidato ── */}
          {totalFilled > 0 && (
            <section>
              <h2 className="section-title">Origem dos Candidatos Contratados</h2>
              <div className="indicators-grid">
                <div className="indicator-card indicator-active">
                  <span className="indicator-value">{indicators.filledBySenai}</span>
                  <span className="indicator-label">Alunos ou egressos do SENAI</span>
                  {senaiRate !== null && (
                    <span className="indicator-rate">{senaiRate}% do total preenchido</span>
                  )}
                </div>
                <div className="indicator-card">
                  <span className="indicator-value">{indicators.filledByOther}</span>
                  <span className="indicator-label">Outros candidatos</span>
                </div>
              </div>
            </section>
          )}

          {/* ── Vagas ativas por tipo de contrato ── */}
          {indicators?.jobsByContractType && Object.keys(indicators.jobsByContractType).length > 0 && (
            <section>
              <h2 className="section-title">Vagas Abertas por Tipo de Contrato</h2>
              <div className="indicators-grid">
                {Object.entries(indicators.jobsByContractType).map(([type, count]) => (
                  <div key={type} className="indicator-card">
                    <span className="indicator-value">{count}</span>
                    <span className="indicator-label">{CONTRACT_TYPE_LABEL[type] ?? type}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Vagas ativas por categoria ── */}
          {indicators?.jobsByCategory?.length > 0 && (
            <section>
              <h2 className="section-title">Vagas Ativas por Área</h2>
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
