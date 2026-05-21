import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import SenaiLogo from "./SenaiLogo";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  {
    to: "/adm",
    end: true,
    label: "Painel",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    to: "/adm/vagas",
    label: "Vagas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    to: "/adm/empresas",
    label: "Empresas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: "/adm/admins",
    label: "Administradores",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

export default function AdmLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/adm/login");
  }

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <Link to="/adm" className="adm-sidebar-brand-link">
            <SenaiLogo size={30} />
            <div className="adm-sidebar-brand-text">
              <span className="adm-sidebar-brand-title">Empregabilidade</span>
              <span className="adm-sidebar-brand-sub">Painel Administrativo</span>
            </div>
          </Link>
        </div>

        <nav className="adm-sidebar-nav" aria-label="Navegação administrativa">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `adm-sidebar-link${isActive ? " active" : ""}`}
            >
              <span className="adm-sidebar-link-icon">{item.icon}</span>
              <span className="adm-sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-sidebar-user-info">
            <span className="adm-sidebar-avatar">{user?.name?.[0]?.toUpperCase()}</span>
            <span className="adm-sidebar-username">{user?.name}</span>
          </div>
          <div className="adm-sidebar-footer-actions">
            <Link to="/mural" className="btn btn-ghost btn-sm">Ver mural</Link>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">Sair</button>
          </div>
        </div>
      </aside>

      <main className="adm-content" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
