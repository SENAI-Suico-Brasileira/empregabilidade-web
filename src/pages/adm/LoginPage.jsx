import { Navigate, Link } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo";
import { BRAND } from "../../brand";
import { useAuth } from "../../hooks/useAuth";
import { useLoginForm } from "../../hooks/useLoginForm";
import { useApp } from "../../context/AppContext";

export default function AdmLoginPage() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useApp();

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
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form-header">
          <BrandLogo size={44} showText={false} />
          <h1>{t("auth.adminArea")}</h1>
          <p>{BRAND.fullName}</p>
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
            placeholder="seu@email.com"
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
          {t("auth.isCompany")} <Link to="/empresas/login">{t("auth.accessHere")}</Link>
        </p>
      </form>
    </div>
  );
}
