/**
 * jobsService — chamadas à API de vagas públicas (/jobs).
 * Usado pelos alunos no mural. Não requer autenticação.
 */
import api from "./api";

export const jobsService = {
  list: (params = {}) => api.get("/jobs", { params }).then((r) => r.data),
  getById: (id) => api.get(`/jobs/${id}`).then((r) => r.data),
};
