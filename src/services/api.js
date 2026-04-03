import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
});

// Injeta o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Trata expiração de sessão: só redireciona se havia um token ativo
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");

      // Só redireciona se havia uma sessão ativa (token expirado).
      // Erros de login (sem token) são tratados pelo catch das páginas.
      if (token) {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = user?.role === "COMPANY" ? "/empresas/login" : "/adm/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
