/**
 * Hook centralizado de autenticação.
 * Lê o estado do localStorage e expõe helpers para login/logout.
 * Toda lógica de "quem está logado" passa por aqui.
 */
export function useAuth() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user.role === "ADMIN";
  const isCompany = isAuthenticated && user.role === "COMPANY";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return { user, token, isAuthenticated, isAdmin, isCompany, logout };
}
