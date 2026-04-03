import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    try {
      // Admin vê todas as vagas (ativas e inativas)
      const [active, inactive] = await Promise.all([
        api.get("/jobs", { params: { status: "ACTIVE" } }),
        api.get("/jobs", { params: { status: "INACTIVE" } }),
      ]);
      setJobs([...active.data, ...inactive.data]);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(job) {
    const newStatus = job.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await api.put(`/jobs/${job.id}`, { status: newStatus });
    fetchJobs();
  }

  async function handleDelete(id) {
    if (!confirm("Tem certeza que deseja excluir esta vaga?")) return;
    await api.delete(`/jobs/${id}`);
    fetchJobs();
  }

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>Painel Administrativo</h1>
        <Link to="/admin/vagas/nova" className="btn btn-primary">
          + Nova Vaga
        </Link>
      </div>

      {loading ? (
        <p className="loading">Carregando...</p>
      ) : (
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.category?.name}</td>
                <td>
                  <span className={`badge ${job.status === "ACTIVE" ? "badge-active" : "badge-inactive"}`}>
                    {job.status === "ACTIVE" ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td>{new Date(job.createdAt).toLocaleDateString("pt-BR")}</td>
                <td className="table-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleToggleStatus(job)}
                  >
                    {job.status === "ACTIVE" ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(job.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
