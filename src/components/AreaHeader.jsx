import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import { BRAND } from "../brand";
import { useAuth } from "../hooks/useAuth";

/**
 * Header interno usado nas áreas /adm e /empresas.
 * Exibe o logo, o nome da área e o usuário logado.
 */
export default function AreaHeader({ areaName, homeHref }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isCompany = homeHref.startsWith("/empresas");

  function handleLogout() {
    const loginPath = isCompany ? "/empresas/login" : "/adm/login";
    logout();
    navigate(loginPath);
  }

  return (
    <header className="area-header">
      <div className="area-header-brand">
        <Link to={homeHref}>
          <BrandLogo size={32} showText={false} />
        </Link>
        <span className="area-header-divider" aria-hidden="true" />
        <span className="area-header-name">{areaName}</span>
      </div>

      <div className="area-header-user">
        {isCompany ? (
          <Link to="/empresas/conta" className="area-header-username area-header-username-link" title="Minha conta">
            {user?.name}
          </Link>
        ) : (
          <span className="area-header-username">{user?.name}</span>
        )}
        <Link to="/mural" className="btn btn-ghost btn-sm">Ver mural</Link>
        <button onClick={handleLogout} className="btn btn-outline btn-sm">Sair</button>
      </div>
    </header>
  );
}
