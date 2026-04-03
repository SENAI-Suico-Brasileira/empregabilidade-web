import { useState } from "react";
import AreaHeader from "../../components/AreaHeader";
import { useAdmEmpresas } from "../../hooks/useAdmEmpresas";

const INITIAL_FORM = {
  name: "",
  cnpj: "",
  description: "",
  contact: "",
  userName: "",
  userEmail: "",
  userPassword: "",
};

export default function AdmEmpresasPage() {
  const { companies, loading, saving, error, createCompany } = useAdmEmpresas();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await createCompany(form);
    if (ok) {
      setShowForm(false);
      setForm(INITIAL_FORM);
    }
  }

  return (
    <>
      <AreaHeader areaName="Gestão de Empresas" homeHref="/adm" />
      <main className="area-main">
        <div className="page">
          <div className="section-header">
            <h2 className="section-title">Empresas Parceiras</h2>
            <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Cancelar" : "+ Nova Empresa"}
            </button>
          </div>

          {/* Formulário de cadastro */}
          {showForm && (
            <form className="job-form" onSubmit={handleSubmit}>
              <h3>Cadastrar Nova Empresa</h3>
              {error && <p className="form-error">{error}</p>}

              <fieldset className="form-section">
                <legend>Dados da Empresa</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nome da Empresa *</label>
                    <input name="name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>CNPJ</label>
                    <input name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="00.000.000/0001-00" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Sobre a empresa</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
                </div>
                <div className="form-group">
                  <label>Contato (nome e telefone)</label>
                  <input name="contact" value={form.contact} onChange={handleChange} placeholder="Nome — (11) 99999-0000" />
                </div>
              </fieldset>

              <fieldset className="form-section">
                <legend>Acesso ao Portal (login da empresa)</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nome do responsável *</label>
                    <input name="userName" value={form.userName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>E-mail de acesso *</label>
                    <input name="userEmail" type="email" value={form.userEmail} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Senha inicial *</label>
                  <input name="userPassword" type="password" value={form.userPassword} onChange={handleChange} required minLength={6} />
                </div>
              </fieldset>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Salvando..." : "Cadastrar Empresa"}
                </button>
              </div>
            </form>
          )}

          {/* Tabela de empresas */}
          {loading ? (
            <p className="loading">Carregando...</p>
          ) : (
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>CNPJ</th>
                  <th>Responsável</th>
                  <th>E-mail</th>
                  <th>Vagas</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.cnpj ?? "—"}</td>
                    <td>{c.user?.name}</td>
                    <td>{c.user?.email}</td>
                    <td>{c._count?.jobs ?? 0}</td>
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
