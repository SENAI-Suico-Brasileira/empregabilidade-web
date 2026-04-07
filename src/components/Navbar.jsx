import { Link, useNavigate } from "react-router-dom";
import SenaiLogo from "./SenaiLogo";
import { BRAND } from "../brand";
import { useAuth } from "../hooks/useAuth";
import { useApp } from "../context/AppContext";

/**
 * Navbar pública — exibida no /mural.
 * Áreas restritas (/adm e /empresas) usam seus próprios headers.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const { isAdmin, isCompany, logout } = useAuth();
  const { t } = useApp();

  function handleLogout() {
    logout();
    navigate("/mural");
  }

  function renderActions() {
    if (isAdmin) {
      return (
        <>
          <Link to="/adm" className="btn btn-outline">{t("nav.adminPanel")}</Link>
          <button onClick={handleLogout} className="btn btn-ghost">{t("nav.logout")}</button>
        </>
      );
    }
    if (isCompany) {
      return (
        <>
          <Link to="/empresas" className="btn btn-outline">{t("nav.companyPanel")}</Link>
          <button onClick={handleLogout} className="btn btn-ghost">{t("nav.logout")}</button>
        </>
      );
    }
    return (
      <>
        <Link to="/empresas/login" className="btn btn-ghost">{t("nav.company")}</Link>
        <Link to="/adm/login" className="btn btn-outline">{t("nav.adminArea")}</Link>
      </>
    );
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Navegação principal">
      <Link to="/mural" className="navbar-brand" aria-label={`${BRAND.fullName} — ${BRAND.portalName}`}>
        <SenaiLogo size={38} />
        <span className="navbar-brand-divider" aria-hidden="true" />
        <span className="navbar-portal-name">{t("nav.portal")}</span>
      </Link>
      <div className="navbar-actions" role="menubar">{renderActions()}</div>
    </nav>
  );
}
