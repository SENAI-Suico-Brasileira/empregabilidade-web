import { Link } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import AreaHeader from "../../components/AreaHeader";
import { useAdmDashboard } from "../../hooks/useAdmDashboard";
import { useApp } from "../../context/AppContext";

// ── Paleta consistente com o design system ────────────────────────────────
const COLOR_PRIMARY   = "#E30613";
const COLOR_SUCCESS   = "#16a34a";
const COLOR_WARNING   = "#d97706";
const COLOR_INFO      = "#2563EB";
const COLOR_MUTED     = "#94a3b8";
const COLOR_PURPLE    = "#7C3AED";

const CONTRACT_COLORS = {
  CLT:        COLOR_PRIMARY,
  APPRENTICE: COLOR_SUCCESS,
  INTERNSHIP: COLOR_INFO,
  PJ:         COLOR_PURPLE,
  OTHER:      COLOR_MUTED,
};

const CONTRACT_LABEL = {
  CLT:        "CLT",
  APPRENTICE: "Jovem Aprendiz",
  INTERNSHIP: "Estágio",
  PJ:         "PJ",
  OTHER:      "Outro",
};

// Tooltip padrão para os gráficos de pizza
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-label">{payload[0].name}</span>
      <span className="chart-tooltip-value">{payload[0].value}</span>
    </div>
  );
}

// Label dentro das fatias da pizza (só exibe se fatia >= 10%)
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) {
  if (percent < 0.1) return null;
  const rad = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * rad);
  const y = cy + radius * Math.sin(-midAngle * rad);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={13} fontWeight={700}>
      {value}
    </text>
  );
}

export default function AdmDashboard() {
  const { t } = useApp();
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

  // ── Dados para os gráficos ──────────────────────────────────────────────

  const totalFilled = (indicators?.filledBySenai ?? 0) + (indicators?.filledByOther ?? 0);
  const senaiRate = totalFilled > 0
    ? Math.round((indicators.filledBySenai / totalFilled) * 100)
    : null;

  // Pizza: origem dos candidatos contratados
  const filledByData = totalFilled > 0 ? [
    { name: "Alunos SENAI", value: indicators.filledBySenai },
    { name: "Outros",       value: indicators.filledByOther },
  ] : [];

  // Pizza: distribuição por tipo de contrato (vagas abertas)
  const contractData = Object.entries(indicators?.jobsByContractType ?? {}).map(
    ([type, count]) => ({ name: CONTRACT_LABEL[type] ?? type, value: count, type })
  );

  // Barras horizontais: vagas por categoria (nome traduzido via slug)
  const categoryData = (indicators?.jobsByCategory ?? [])
    .sort((a, b) => b.count - a.count)
    .map((c) => ({
      name: c.categorySlug ? t(`category.${c.categorySlug}`) : c.categoryName,
      vagas: c.count,
    }));

  // Barras: funil de status das vagas
  const statusOrder = ["ACTIVE", "IN_PROGRESS", "PENDING", "COMPLETED", "INACTIVE", "REJECTED"];
  const statusLabel  = {
    ACTIVE:      "Ativas",
    IN_PROGRESS: "Em andamento",
    PENDING:     "Pendentes",
    COMPLETED:   "Preenchidas",
    INACTIVE:    "Pausadas",
    REJECTED:    "Reprovadas",
  };
  const statusColor = {
    ACTIVE:      COLOR_SUCCESS,
    IN_PROGRESS: COLOR_INFO,
    PENDING:     COLOR_WARNING,
    COMPLETED:   COLOR_PRIMARY,
    INACTIVE:    COLOR_MUTED,
    REJECTED:    "#dc2626",
  };
  const statusData = statusOrder
    .filter((s) => (indicators?.jobsByStatus?.[s] ?? 0) > 0)
    .map((s) => ({
      name:  statusLabel[s],
      total: indicators.jobsByStatus[s],
      fill:  statusColor[s],
    }));

  return (
    <>
      <AreaHeader areaName="Painel Administrativo" homeHref="/adm" />

      <main className="area-main">
        <div className="page">

          {/* ── KPIs principais ── */}
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

          {/* ── Gráficos lado a lado ── */}
          <section>
            <div className="charts-row">

              {/* Funil de status: bar chart horizontal — boa para comparar magnitudes */}
              {statusData.length > 0 && (
                <div className="chart-card">
                  <h3 className="chart-title">Status das Vagas</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={statusData}
                      layout="vertical"
                      margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                      <Tooltip
                        formatter={(v) => [v, "vagas"]}
                        contentStyle={{ fontSize: 13, borderRadius: 8 }}
                      />
                      <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={20}>
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Tipo de contrato: pizza — boa para distribuição proporcional */}
              {contractData.length > 0 && (
                <div className="chart-card">
                  <h3 className="chart-title">Tipos de Contrato (vagas abertas)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={contractData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        labelLine={false}
                        label={PieLabel}
                      >
                        {contractData.map((entry) => (
                          <Cell key={entry.type} fill={CONTRACT_COLORS[entry.type] ?? COLOR_MUTED} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

            </div>
          </section>

          {/* ── Origem dos candidatos contratados ── */}
          {filledByData.length > 0 && (
            <section>
              <div className="charts-row">

                {/* Pizza: proporção SENAI vs outros — simples e direto */}
                <div className="chart-card">
                  <h3 className="chart-title">Origem dos Candidatos Contratados</h3>
                  <div className="chart-with-kpi">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={filledByData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          labelLine={false}
                          label={PieLabel}
                        >
                          <Cell fill={COLOR_SUCCESS} />
                          <Cell fill={COLOR_MUTED} />
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    {senaiRate !== null && (
                      <div className="chart-kpi">
                        <span className="chart-kpi-value" style={{ color: COLOR_SUCCESS }}>
                          {senaiRate}%
                        </span>
                        <span className="chart-kpi-label">das vagas preenchidas por alunos SENAI</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vagas por área: bar chart horizontal — boa para comparar categorias */}
                {categoryData.length > 0 && (
                  <div className="chart-card">
                    <h3 className="chart-title">Vagas Ativas por Área</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={categoryData}
                        layout="vertical"
                        margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                        <Tooltip
                          formatter={(v) => [v, "vagas"]}
                          contentStyle={{ fontSize: 13, borderRadius: 8 }}
                        />
                        <Bar dataKey="vagas" fill={COLOR_PRIMARY} radius={[0, 4, 4, 0]} maxBarSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

              </div>
            </section>
          )}

          {/* Se não há dados de preenchimento, exibe só o gráfico de áreas */}
          {filledByData.length === 0 && categoryData.length > 0 && (
            <section>
              <div className="charts-row">
                <div className="chart-card">
                  <h3 className="chart-title">Vagas Ativas por Área</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={categoryData}
                      layout="vertical"
                      margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                      <Tooltip
                        formatter={(v) => [v, "vagas"]}
                        contentStyle={{ fontSize: 13, borderRadius: 8 }}
                      />
                      <Bar dataKey="vagas" fill={COLOR_PRIMARY} radius={[0, 4, 4, 0]} maxBarSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          )}

          {/* ── Fila de aprovação ── */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Vagas Pendentes de Aprovação</h2>
              <Link to="/adm/vagas" className="btn btn-outline btn-sm">Ver todas</Link>
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
                      <td>
                        {job.category?.slug
                          ? t(`category.${job.category.slug}`)
                          : job.category?.name}
                      </td>
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
