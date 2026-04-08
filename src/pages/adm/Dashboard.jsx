import { Link } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import AreaHeader from "../../components/AreaHeader";
import RejectModal from "../../components/RejectModal";
import { useAdmDashboard } from "../../hooks/useAdmDashboard";
import { useApp } from "../../context/AppContext";
import { useState } from "react";

// ── Design tokens (mirrors CSS variables) ────────────────────────────────────
const C_RED    = "#E30613";
const C_GREEN  = "#16a34a";
const C_AMBER  = "#d97706";
const C_BLUE   = "#2563EB";
const C_MUTED  = "#94a3b8";
const C_PURPLE = "#7C3AED";
const C_TEAL   = "#0891b2";

const CONTRACT_COLORS = {
  CLT: C_RED, APPRENTICE: C_GREEN, INTERNSHIP: C_BLUE, PJ: C_PURPLE, OTHER: C_MUTED,
};
const CONTRACT_LABEL = {
  CLT: "CLT", APPRENTICE: "Jovem Aprendiz", INTERNSHIP: "Estágio", PJ: "PJ", OTHER: "Outro",
};

const MODALITY_LABEL = {
  FIC: "FIC", TECNICO: "Técnico", CAI: "CAI",
  SUPERIOR: "Superior", POS_GRADUACAO: "Pós-Grad.", EGRESSO: "Egresso",
};
const MODALITY_COLORS = [C_RED, C_BLUE, C_GREEN, C_AMBER, C_PURPLE, C_TEAL];

// ── Tooltip padrão ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, unit = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-label">{payload[0].name}</span>
      <span className="chart-tooltip-value">{payload[0].value}{unit}</span>
    </div>
  );
}

// Label dentro de fatia de pizza (só para fatias >= 10%)
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) {
  if (percent < 0.1) return null;
  const rad    = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text
      x={cx + radius * Math.cos(-midAngle * rad)}
      y={cy + radius * Math.sin(-midAngle * rad)}
      fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={13} fontWeight={700}
    >
      {value}
    </text>
  );
}

// ── Componente de KPI ─────────────────────────────────────────────────────────
function KpiCard({ value, label, accent, sub }) {
  return (
    <div className="indicator-card" style={accent ? { borderLeft: `3px solid ${accent}` } : {}}>
      <span className="indicator-value">{value ?? "—"}</span>
      <span className="indicator-label">{label}</span>
      {sub && <span className="indicator-rate">{sub}</span>}
    </div>
  );
}

export default function AdmDashboard() {
  const { t } = useApp();
  const { indicators, pendingJobs, loading, approveJob, rejectJob } = useAdmDashboard();
  const [rejectTarget, setRejectTarget] = useState(null);
  const [saving, setSaving]             = useState(false);

  async function handleConfirmReject(reason) {
    setSaving(true);
    await rejectJob(rejectTarget, reason);
    setSaving(false);
    setRejectTarget(null);
  }

  if (loading) {
    return (
      <>
        <AreaHeader areaName="Painel Administrativo" homeHref="/adm" />
        <p className="loading">Carregando...</p>
      </>
    );
  }

  // ── Dados derivados ──────────────────────────────────────────────────────────

  const totalFilled = (indicators?.filledBySenai ?? 0) + (indicators?.filledByOther ?? 0);
  const senaiRate   = totalFilled > 0
    ? Math.round((indicators.filledBySenai / totalFilled) * 100)
    : null;

  const filledByData = totalFilled > 0 ? [
    { name: "Alunos SENAI", value: indicators.filledBySenai },
    { name: "Outros",       value: indicators.filledByOther },
  ] : [];

  const contractData = Object.entries(indicators?.jobsByContractType ?? {}).map(
    ([type, count]) => ({ name: CONTRACT_LABEL[type] ?? type, value: count, type })
  );

  const categoryData = (indicators?.jobsByCategory ?? [])
    .sort((a, b) => b.count - a.count)
    .map((c) => ({
      name:  c.categorySlug ? t(`category.${c.categorySlug}`) : c.categoryName,
      vagas: c.count,
    }));

  const statusOrder = ["ACTIVE", "IN_PROGRESS", "PENDING", "COMPLETED", "INACTIVE", "REJECTED"];
  const STATUS_LABEL = {
    ACTIVE: "Ativas", IN_PROGRESS: "Em andamento", PENDING: "Pendentes",
    COMPLETED: "Preenchidas", INACTIVE: "Pausadas", REJECTED: "Reprovadas",
  };
  const STATUS_COLOR = {
    ACTIVE: C_GREEN, IN_PROGRESS: C_BLUE, PENDING: C_AMBER,
    COMPLETED: C_RED, INACTIVE: C_MUTED, REJECTED: "#dc2626",
  };
  const statusData = statusOrder
    .filter((s) => (indicators?.jobsByStatus?.[s] ?? 0) > 0)
    .map((s) => ({ name: STATUS_LABEL[s], total: indicators.jobsByStatus[s], fill: STATUS_COLOR[s] }));

  const modalityData = (indicators?.applicationsByModality ?? [])
    .map((m) => ({ name: MODALITY_LABEL[m.modality] ?? m.modality, value: m.count }))
    .sort((a, b) => b.value - a.value);

  const topJobsData = (indicators?.topJobsByApplications ?? [])
    .map((j) => ({ name: j.title.length > 28 ? j.title.slice(0, 28) + "…" : j.title, candidatos: j.count }));

  const totalApplicants   = indicators?.totalApplicants   ?? 0;
  const totalApplications = indicators?.totalApplications ?? 0;
  const avgPerJob         = indicators?.avgApplicationsPerJob ?? 0;
  const hasApplicantsData = totalApplications > 0;

  return (
    <>
      <AreaHeader areaName="Painel Administrativo" homeHref="/adm" />
      <main className="area-main">
        <div className="page">

          {/* ── Seção 1: KPIs de vagas ── */}
          <section>
            <h2 className="section-title">Visão Geral — Vagas</h2>
            <div className="indicators-grid">
              <KpiCard value={indicators?.jobsByStatus?.PENDING ?? 0}     label="Aguardando aprovação" accent={C_AMBER} />
              <KpiCard value={indicators?.jobsByStatus?.ACTIVE ?? 0}      label="Vagas ativas no mural" accent={C_GREEN} />
              <KpiCard value={indicators?.jobsByStatus?.IN_PROGRESS ?? 0} label="Seleções em andamento" accent={C_BLUE} />
              <KpiCard value={indicators?.jobsByStatus?.COMPLETED ?? 0}   label="Vagas preenchidas" accent={C_RED}
                sub={senaiRate !== null ? `${senaiRate}% por alunos SENAI` : null} />
              <KpiCard value={indicators?.totalCompanies ?? 0}            label="Empresas cadastradas" />
              <KpiCard value={indicators?.companiesWithActiveJobs ?? 0}   label="Empresas com vagas ativas" />
            </div>
          </section>

          {/* ── Seção 2: KPIs de candidaturas ── */}
          {hasApplicantsData && (
            <section>
              <h2 className="section-title">Visão Geral — Candidaturas</h2>
              <div className="indicators-grid">
                <KpiCard value={totalApplicants}   label="Candidatos cadastrados" accent={C_TEAL} />
                <KpiCard value={totalApplications} label="Candidaturas realizadas" accent={C_PURPLE} />
                <KpiCard value={avgPerJob}          label="Média de candidatos por vaga" />
              </div>
            </section>
          )}

          {/* ── Seção 3: Status × Tipo de Contrato ── */}
          {(statusData.length > 0 || contractData.length > 0) && (
            <section>
              <div className="charts-row">

                {statusData.length > 0 && (
                  <div className="chart-card">
                    <h3 className="chart-title">Status das Vagas</h3>
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart
                        data={statusData}
                        layout="vertical"
                        margin={{ top: 0, right: 28, left: 8, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={105} />
                        <Tooltip
                          formatter={(v) => [v, "vagas"]}
                          contentStyle={{ fontSize: 13, borderRadius: 8 }}
                        />
                        <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={20}>
                          {statusData.map((e) => <Cell key={e.name} fill={e.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {contractData.length > 0 && (
                  <div className="chart-card">
                    <h3 className="chart-title">Tipos de Contrato (vagas em aberto)</h3>
                    <ResponsiveContainer width="100%" height={230}>
                      <PieChart>
                        <Pie
                          data={contractData}
                          cx="50%" cy="50%"
                          outerRadius={82}
                          dataKey="value"
                          labelLine={false}
                          label={PieLabel}
                        >
                          {contractData.map((e) => (
                            <Cell key={e.type} fill={CONTRACT_COLORS[e.type] ?? C_MUTED} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

              </div>
            </section>
          )}

          {/* ── Seção 4: Origem dos contratados × Vagas por área ── */}
          {(filledByData.length > 0 || categoryData.length > 0) && (
            <section>
              <div className="charts-row">

                {filledByData.length > 0 && (
                  <div className="chart-card">
                    <h3 className="chart-title">Origem dos Candidatos Contratados</h3>
                    <div className="chart-with-kpi">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={filledByData}
                            cx="50%" cy="50%"
                            innerRadius={48} outerRadius={80}
                            dataKey="value"
                            labelLine={false}
                            label={PieLabel}
                          >
                            <Cell fill={C_GREEN} />
                            <Cell fill={C_MUTED} />
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      {senaiRate !== null && (
                        <div className="chart-kpi">
                          <span className="chart-kpi-value" style={{ color: C_GREEN }}>{senaiRate}%</span>
                          <span className="chart-kpi-label">preenchidas por alunos SENAI</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {categoryData.length > 0 && (
                  <div className="chart-card">
                    <h3 className="chart-title">Vagas Ativas por Área</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={categoryData}
                        layout="vertical"
                        margin={{ top: 0, right: 28, left: 8, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={92} />
                        <Tooltip
                          formatter={(v) => [v, "vagas"]}
                          contentStyle={{ fontSize: 13, borderRadius: 8 }}
                        />
                        <Bar dataKey="vagas" fill={C_RED} radius={[0, 4, 4, 0]} maxBarSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

              </div>
            </section>
          )}

          {/* ── Seção 5: BI de Candidaturas ── */}
          {hasApplicantsData && (
            <section>
              <h2 className="section-title">Análise de Candidaturas</h2>
              <div className="charts-row">

                {/* Candidaturas por modalidade de ensino */}
                {modalityData.length > 0 && (
                  <div className="chart-card">
                    <h3 className="chart-title">Candidatos por Modalidade de Ensino</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={modalityData}
                        layout="vertical"
                        margin={{ top: 0, right: 28, left: 8, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                        <Tooltip
                          formatter={(v) => [v, "candidatos"]}
                          contentStyle={{ fontSize: 13, borderRadius: 8 }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
                          {modalityData.map((_, i) => (
                            <Cell key={i} fill={MODALITY_COLORS[i % MODALITY_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Top vagas com mais candidaturas */}
                {topJobsData.length > 0 && (
                  <div className="chart-card">
                    <h3 className="chart-title">Top Vagas por Candidaturas</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={topJobsData}
                        layout="vertical"
                        margin={{ top: 0, right: 28, left: 8, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={115} />
                        <Tooltip
                          formatter={(v) => [v, "candidatos"]}
                          contentStyle={{ fontSize: 13, borderRadius: 8 }}
                        />
                        <Bar dataKey="candidatos" fill={C_PURPLE} radius={[0, 4, 4, 0]} maxBarSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

              </div>
            </section>
          )}

          {/* ── Seção 6: Fila de aprovação ── */}
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
                          {t("common.approve")}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => setRejectTarget(job.id)}>
                          {t("common.reject")}
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
