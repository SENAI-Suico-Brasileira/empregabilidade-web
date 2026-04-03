/**
 * admService — operações do painel administrativo (/adm).
 * Requer autenticação com role ADMIN.
 */
import api from "./api";

export const admService = {
  getIndicators: () => api.get("/adm/indicadores").then((r) => r.data),

  listJobs: (params = {}) => api.get("/adm/vagas", { params }).then((r) => r.data),
  approveJob: (id) => api.patch(`/adm/vagas/${id}/aprovar`).then((r) => r.data),
  rejectJob: (id, reason) =>
    api.patch(`/adm/vagas/${id}/reprovar`, { reason }).then((r) => r.data),

  listCompanies: () => api.get("/adm/empresas").then((r) => r.data),
  getCompany: (id) => api.get(`/adm/empresas/${id}`).then((r) => r.data),
  createCompany: (data) => api.post("/adm/empresas", data).then((r) => r.data),
  updateCompany: (id, data) => api.put(`/adm/empresas/${id}`, data).then((r) => r.data),
};
