import { Link, useNavigate } from "react-router-dom";
import SenaiLogo from "./SenaiLogo";
import { BRAND } from "../brand";
import { useAuth } from "../hooks/useAuth";

/**
 * Header interno usado nas áreas /adm e /empresas.
 * Exibe o logo, o nome da área e o usuário logado.
 */
export default function AreaHeader({ areaName, homeHref }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    const loginPath = homeHref.startsWith("/adm") ? "/adm/login" : "/empresas/login";
    logout();
    navigate(loginPath);
  }

  return (
    <header className="area-header">
      <div className="area-header-brand">
        <Link to={homeHref}>
          <SenaiLogo size={32} />
        </Link>
        <span className="area-header-divider" aria-hidden="true" />
        <span className="area-header-name">{areaName}</span>
      </div>

      <div className="area-header-user">
        <span className="area-header-username">{user?.name}</span>
        <Link to="/mural" className="btn btn-ghost btn-sm">Ver mural</Link>
        <button onClick={handleLogout} className="btn btn-outline btn-sm">Sair</button>
      </div>
    </header>
  );
}
