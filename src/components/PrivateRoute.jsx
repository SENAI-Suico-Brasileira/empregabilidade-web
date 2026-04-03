import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const REDIRECT_BY_ROLE = {
  ADMIN: "/adm/login",
  COMPANY: "/empresas/login",
};

/**
 * Protege rotas por role.
 * Se não autenticado, redireciona para o login da área correspondente.
 * Se autenticado mas com role errado, redireciona para o login correto.
 */
export default function PrivateRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to={REDIRECT_BY_ROLE[role]} replace />;
  if (user.role !== role) return <Navigate to={REDIRECT_BY_ROLE[role]} replace />;

  return children;
}
