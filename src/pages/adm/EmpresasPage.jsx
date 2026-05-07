import { useState } from "react";
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
    <div className="adm-page">
      <div className="adm-page-header">
        <div className="adm-page-header-text">
          <h1 className="adm-page-title">Empresas</h1>
          <p className="adm-page-desc">Cadastro e gestão das empresas parceiras</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "+ Nova Empresa"}
        </button>
      </div>

      {/* Formulário de cadastro */}
      {showForm && (
        <section className="adm-section">
          <h2 className="adm-section-title">Nova Empresa</h2>
          <form className="job-form" onSubmit={handleSubmit}>
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
        </section>
      )}

      {/* Tabela de empresas */}
      <section className="adm-section">
        <h2 className="adm-section-title">Empresas Cadastradas</h2>
        {loading ? (
          <p className="loading">Carregando...</p>
        ) : companies.length === 0 ? (
          <p className="empty">Nenhuma empresa cadastrada ainda.</p>
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
      </section>
    </div>
  );
}
