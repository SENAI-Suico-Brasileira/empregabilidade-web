import { useState } from "react";
import AreaHeader from "../../components/AreaHeader";
import { useAuth } from "../../hooks/useAuth";
import { companyService } from "../../services/companyService";

export default function EmpresaContaPage() {
  const { user } = useAuth();

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess(false);
    if (form.newPassword !== form.confirm) { setError("As senhas não coincidem."); return; }
    if (form.newPassword.length < 6)       { setError("A nova senha deve ter ao menos 6 caracteres."); return; }
    setSaving(true);
    try {
      await companyService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao alterar senha.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AreaHeader areaName="Minha Conta" homeHref="/empresas" />
      <main className="area-main">
        <div className="page">

          <div className="conta-header">
            <div className="conta-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p className="conta-name">{user?.name}</p>
              <p className="conta-email">{user?.email}</p>
            </div>
          </div>

          <div className="conta-card">
            <h2 className="conta-card-title">Alterar Senha</h2>
            <p className="conta-card-desc">
              Use uma senha forte com ao menos 6 caracteres.
            </p>

            <form onSubmit={handleSubmit} className="conta-form">
              {error   && <p className="form-error">{error}</p>}
              {success && <p className="form-success">Senha alterada com sucesso!</p>}

              <div className="form-group">
                <label>Senha atual</label>
                <input
                  type="password"
                  value={form.currentPassword}
                  autoComplete="current-password"
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nova senha</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    autoComplete="new-password"
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Confirmar nova senha</label>
                  <input
                    type="password"
                    value={form.confirm}
                    autoComplete="new-password"
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Salvando..." : "Alterar Senha"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>
    </>
  );
}
