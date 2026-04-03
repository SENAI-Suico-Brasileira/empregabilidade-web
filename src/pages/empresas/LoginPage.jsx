import { Navigate, Link } from "react-router-dom";
import SenaiLogo from "../../components/SenaiLogo";
import { BRAND } from "../../brand";
import { useAuth } from "../../hooks/useAuth";
import { useLoginForm } from "../../hooks/useLoginForm";

export default function EmpresaLoginPage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user.role === "COMPANY" ? "/empresas" : "/adm"} replace />;
  }

  const { form, error, loading, handleChange, handleSubmit } = useLoginForm({
    expectedRole: "COMPANY",
    redirectTo: "/empresas",
    altLoginPath: "a área administrativa",
  });

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-header">
          <SenaiLogo size={44} />
          <h1>Área da Empresa</h1>
          <p>{BRAND.portalName}</p>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="rh@suaempresa.com.br"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="auth-link">
          É analista SENAI? <Link to="/adm/login">Acesse aqui</Link>
        </p>
      </form>
    </div>
  );
}
