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
  toggleCompanyActive: (id) => api.patch(`/adm/empresas/${id}/toggle-ativo`).then((r) => r.data),
  resetCompanyPassword: (id, newPassword) =>
    api.post(`/adm/empresas/${id}/resetar-senha`, { newPassword }).then((r) => r.data),

  listApplicants: (jobId) =>
    api.get(`/adm/vagas/${jobId}/candidatos`).then((r) => r.data),

  listAdmins: () => api.get("/adm/admins").then((r) => r.data),
  createAdmin: (data) => api.post("/adm/admins", data).then((r) => r.data),
  toggleAdminActive: (id) => api.patch(`/adm/admins/${id}/toggle-ativo`).then((r) => r.data),
  resetAdminPassword: (id, newPassword) =>
    api.post(`/adm/admins/${id}/resetar-senha`, { newPassword }).then((r) => r.data),
};
