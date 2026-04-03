import { Navigate, Link } from "react-router-dom";
import SenaiLogo from "../../components/SenaiLogo";
import { BRAND } from "../../brand";
import { useAuth } from "../../hooks/useAuth";
import { useLoginForm } from "../../hooks/useLoginForm";

export default function AdmLoginPage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user.role === "ADMIN" ? "/adm" : "/empresas"} replace />;
  }

  const { form, error, loading, handleChange, handleSubmit } = useLoginForm({
    expectedRole: "ADMIN",
    redirectTo: "/adm",
    altLoginPath: "a área de empresas",
  });

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-header">
          <SenaiLogo size={44} />
          <h1>Área Administrativa</h1>
          <p>{BRAND.fullName}</p>
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
            placeholder="seu@senai.com.br"
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
          É empresa? <Link to="/empresas/login">Acesse aqui</Link>
        </p>
      </form>
    </div>
  );
}
