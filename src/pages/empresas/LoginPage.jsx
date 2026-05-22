import { Navigate, Link } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo";
import { BRAND } from "../../brand";
import { useAuth } from "../../hooks/useAuth";
import { useLoginForm } from "../../hooks/useLoginForm";
import { useApp } from "../../context/AppContext";

export default function EmpresaLoginPage() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useApp();

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
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form-header">
          <BrandLogo size={44} showText={false} />
          <h1>{t("auth.companyArea")}</h1>
          <p>{BRAND.portalName}</p>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-group">
          <label htmlFor="email">{t("auth.email")}</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="rh@suaempresa.com.br"
            required
            autoComplete="email"
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t("auth.password")}</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            aria-required="true"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? t("auth.logging") : t("auth.login")}
        </button>

        <p className="auth-link">
          {t("auth.isSenai")} <Link to="/adm/login">{t("auth.accessHere")}</Link>
        </p>
      </form>
    </div>
  );
}
