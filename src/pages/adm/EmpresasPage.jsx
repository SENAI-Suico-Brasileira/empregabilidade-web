import { useState } from "react";
import { useAdmEmpresas } from "../../hooks/useAdmEmpresas";

const INITIAL_FORM = {
  name: "", cnpj: "", description: "", contact: "",
  userName: "", userEmail: "", userPassword: "",
};

const INITIAL_EDIT = { name: "", cnpj: "", description: "", contact: "" };

export default function AdmEmpresasPage() {
  const {
    companies, loading, saving, error, setError,
    createCompany, updateCompany, toggleCompanyActive, resetCompanyPassword,
  } = useAdmEmpresas();

  // Formulário nova empresa
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(INITIAL_FORM);

  // Edição inline
  const [editingId, setEditingId]   = useState(null);
  const [editForm, setEditForm]     = useState(INITIAL_EDIT);
  const [editError, setEditError]   = useState("");

  // Reset de senha
  const [resetId, setResetId]       = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetDone, setResetDone]   = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await createCompany(form);
    if (ok) { setShowForm(false); setForm(INITIAL_FORM); }
  }

  function startEdit(company) {
    setEditingId(company.id);
    setEditForm({
      name: company.name ?? "",
      cnpj: company.cnpj ?? "",
      description: company.description ?? "",
      contact: company.contact ?? "",
    });
    setEditError("");
  }

  async function handleEdit(e) {
    e.preventDefault();
    const ok = await updateCompany(editingId, editForm);
    if (ok) { setEditingId(null); setEditError(""); }
    else setEditError(error);
  }

  async function handleToggleActive(company) {
    setError("");
    await toggleCompanyActive(company.id);
  }

  function startReset(id) {
    setResetId(id);
    setNewPassword("");
    setResetError("");
    setResetDone(false);
  }

  async function handleReset(e) {
    e.preventDefault();
    if (newPassword.length < 6) { setResetError("Mínimo de 6 caracteres."); return; }
    const ok = await resetCompanyPassword(resetId, newPassword);
    if (ok) setResetDone(true);
    else setResetError(error);
  }

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div className="adm-page-header-text">
          <h1 className="adm-page-title">Empresas</h1>
          <p className="adm-page-desc">Cadastro e gestão das empresas parceiras</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm((v) => !v); setError(""); }}>
          {showForm ? "Cancelar" : "+ Nova Empresa"}
        </button>
      </div>

      {/* ── Formulário nova empresa ── */}
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

      {/* ── Tabela de empresas ── */}
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
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <>
                  <tr key={c.id} className={!c.user?.active ? "row-inactive" : ""}>
                    <td>{c.name}</td>
                    <td>{c.cnpj ?? "—"}</td>
                    <td>{c.user?.name}</td>
                    <td>{c.user?.email}</td>
                    <td>{c._count?.jobs ?? 0}</td>
                    <td>
                      <span className={`badge ${c.user?.active ? "badge-active" : "badge-inactive"}`}>
                        {c.user?.active ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="table-actions">
                      <button className="btn btn-sm btn-outline"
                        onClick={() => editingId === c.id ? setEditingId(null) : startEdit(c)}>
                        {editingId === c.id ? "Cancelar" : "Editar"}
                      </button>
                      <button className="btn btn-sm btn-outline"
                        onClick={() => resetId === c.id ? setResetId(null) : startReset(c.id)}>
                        {resetId === c.id ? "Cancelar" : "Senha"}
                      </button>
                      <button
                        className={`btn btn-sm ${c.user?.active ? "btn-danger" : "btn-success"}`}
                        onClick={() => handleToggleActive(c)}>
                        {c.user?.active ? "Desativar" : "Ativar"}
                      </button>
                    </td>
                  </tr>

                  {/* ── Formulário de edição inline ── */}
                  {editingId === c.id && (
                    <tr key={`edit-${c.id}`}>
                      <td colSpan={7} className="inline-form-cell">
                        <form className="inline-form" onSubmit={handleEdit}>
                          <h4 className="inline-form-title">Editar dados da empresa</h4>
                          {editError && <p className="form-error">{editError}</p>}
                          <div className="form-row">
                            <div className="form-group">
                              <label>Nome *</label>
                              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                              <label>CNPJ</label>
                              <input value={editForm.cnpj} onChange={(e) => setEditForm({ ...editForm, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
                            </div>
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Sobre a empresa</label>
                              <textarea rows={2} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label>Contato</label>
                              <input value={editForm.contact} onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })} placeholder="Nome — (11) 99999-0000" />
                            </div>
                          </div>
                          <div className="form-actions">
                            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                              {saving ? "Salvando..." : "Salvar"}
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}

                  {/* ── Reset de senha inline ── */}
                  {resetId === c.id && (
                    <tr key={`reset-${c.id}`}>
                      <td colSpan={7} className="inline-form-cell">
                        {resetDone ? (
                          <div className="inline-form">
                            <p className="inline-form-success">Senha redefinida com sucesso. Informe a nova senha para o responsável da empresa.</p>
                            <button className="btn btn-sm btn-outline" onClick={() => setResetId(null)}>Fechar</button>
                          </div>
                        ) : (
                          <form className="inline-form" onSubmit={handleReset}>
                            <h4 className="inline-form-title">Redefinir senha de acesso</h4>
                            {resetError && <p className="form-error">{resetError}</p>}
                            <div className="form-group" style={{ maxWidth: 320 }}>
                              <label>Nova senha (mín. 6 caracteres)</label>
                              <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={6}
                                required
                                autoComplete="new-password"
                              />
                            </div>
                            <div className="form-actions">
                              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                                Redefinir Senha
                              </button>
                            </div>
                          </form>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
