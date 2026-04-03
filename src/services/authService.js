/**
 * authService — autenticação de usuários (/auth).
 * Compartilhado entre admin e empresa — a distinção de role
 * é feita em cada página de login após o retorno.
 */
import api from "./api";

export const authService = {
  login: (credentials) => api.post("/auth/login", credentials).then((r) => r.data),
};
