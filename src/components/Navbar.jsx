import { Link, useNavigate } from "react-router-dom";
import SenaiLogo from "./SenaiLogo";
import { BRAND } from "../brand";
import { useAuth } from "../hooks/useAuth";

/**
 * Navbar pública exibida no /mural.
 * Áreas restritas (/adm e /empresas) usam seus próprios headers.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const { isAdmin, isCompany, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/mural");
  }

  function renderActions() {
    if (isAdmin) {
      return (
        <>
          <Link to="/adm" className="btn btn-outline">Painel Admin</Link>
          <button onClick={handleLogout} className="btn btn-ghost">Sair</button>
        </>
      );
    }
    if (isCompany) {
      return (
        <>
          <Link to="/empresas" className="btn btn-outline">Painel Empresa</Link>
          <button onClick={handleLogout} className="btn btn-ghost">Sair</button>
        </>
      );
    }
    return (
      <>
        <Link to="/empresas/login" className="btn btn-ghost">Sou empresa</Link>
        <Link to="/adm/login" className="btn btn-outline">Área SENAI</Link>
      </>
    );
  }

  return (
    <nav className="navbar">
      <Link to="/mural" className="navbar-brand" aria-label={`${BRAND.fullName} — ${BRAND.portalName}`}>
        <SenaiLogo size={38} />
        <span className="navbar-brand-divider" aria-hidden="true" />
        <span className="navbar-portal-name">{BRAND.portalName}</span>
      </Link>
      <div className="navbar-actions">{renderActions()}</div>
    </nav>
  );
}
