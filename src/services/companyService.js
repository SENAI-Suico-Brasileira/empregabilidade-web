/**
 * companyService — operações da área da empresa (/empresa).
 * Requer autenticação com role COMPANY.
 */
import api from "./api";

export const companyService = {
  getProfile: () => api.get("/empresa/perfil").then((r) => r.data),
  updateProfile: (data) => api.put("/empresa/perfil", data).then((r) => r.data),

  listJobs: () => api.get("/empresa/vagas").then((r) => r.data),
  listCompletedTemplates: () => api.get("/empresa/vagas/templates").then((r) => r.data),
  createJob: (data) => api.post("/empresa/vagas", data).then((r) => r.data),

  // extraData: { filledBy, filledStudentName } para COMPLETED, { pauseReason } para INACTIVE
  updateJobStatus: (id, status, extraData = {}) =>
    api.patch(`/empresa/vagas/${id}/status`, { status, ...extraData }).then((r) => r.data),

  listApplicants: (jobId) =>
    api.get(`/empresa/vagas/${jobId}/candidatos`).then((r) => r.data),
};
