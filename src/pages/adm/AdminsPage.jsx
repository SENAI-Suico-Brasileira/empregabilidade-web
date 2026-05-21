import { useState } from "react";
import { useAdmAdmins } from "../../hooks/useAdmAdmins";
import { useAuth } from "../../hooks/useAuth";

const INITIAL_FORM = { name: "", email: "", password: "" };

export default function AdmAdminsPage() {
  const { user: currentUser } = useAuth();
  const {
    admins, loading, saving, error, setError,
    createAdmin, toggleAdminActive, resetAdminPassword,
  } = useAdmAdmins();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const [resetId, setResetId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetDone, setResetDone] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await createAdmin(form);
    if (ok) { setShowForm(false); setForm(INITIAL_FORM); }
  }

  async function handleToggleActive(admin) {
    setError("");
    await toggleAdminActive(admin.id);
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
    const ok = await resetAdminPassword(resetId, newPassword);
    if (ok) setResetDone(true);
    else setResetError(error);
  }

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div className="adm-page-header-text">
          <h1 className="adm-page-title">Administradores</h1>
          <p className="adm-page-desc">Analistas do SENAI com acesso ao painel</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm((v) => !v); setError(""); }}>
          {showForm ? "Cancelar" : "+ Novo Administrador"}
        </button>
      </div>

      {showForm && (
        <section className="adm-section">
          <h2 className="adm-section-title">Novo Administrador</h2>
          <form className="job-form" onSubmit={handleSubmit}>
            {error && <p className="form-error">{error}</p>}
            <fieldset className="form-section">
              <legend>Dados de acesso</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome completo *</label>
                  <input name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>E-mail de acesso *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="off" />
                </div>
              </div>
              <div className="form-group">
                <label>Senha inicial * (mín. 6 caracteres)</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} autoComplete="new-password" />
              </div>
            </fieldset>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Salvando..." : "Cadastrar Administrador"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="adm-section">
        <h2 className="adm-section-title">Administradores Cadastrados</h2>
        {loading ? (
          <p className="loading">Carregando...</p>
        ) : admins.length === 0 ? (
          <p className="empty">Nenhum administrador cadastrado.</p>
        ) : (
          <div className="table-wrap">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => {
                  const isSelf = currentUser?.id === a.id;
                  return (
                    <>
                      <tr key={a.id} className={!a.active ? "row-inactive" : ""}>
                        <td>
                          {a.name}
                          {isSelf && <span className="badge badge-active" style={{ marginLeft: 8 }}>Você</span>}
                        </td>
                        <td>{a.email}</td>
                        <td>
                          <span className={`badge ${a.active ? "badge-active" : "badge-inactive"}`}>
                            {a.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="table-actions">
                          <button className="btn btn-sm btn-outline"
                            onClick={() => resetId === a.id ? setResetId(null) : startReset(a.id)}>
                            {resetId === a.id ? "Cancelar" : "Senha"}
                          </button>
                          <button
                            className={`btn btn-sm ${a.active ? "btn-danger" : "btn-success"}`}
                            onClick={() => handleToggleActive(a)}
                            disabled={isSelf}
                            title={isSelf ? "Você não pode desativar a própria conta" : undefined}>
                            {a.active ? "Desativar" : "Ativar"}
                          </button>
                        </td>
                      </tr>

                      {resetId === a.id && (
                        <tr key={`reset-${a.id}`}>
                          <td colSpan={4} className="inline-form-cell">
                            {resetDone ? (
                              <div className="inline-form">
                                <p className="inline-form-success">Senha redefinida com sucesso.</p>
                                <button className="btn btn-sm btn-outline" onClick={() => setResetId(null)}>Fechar</button>
                              </div>
                            ) : (
                              <form className="inline-form" onSubmit={handleReset}>
                                <h4 className="inline-form-title">Redefinir senha de {a.name}</h4>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
