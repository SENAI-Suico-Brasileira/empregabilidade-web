/**
 * categoriesService — chamadas à API de categorias (/categories).
 * Público: usado no filtro do mural e nos formulários de vaga.
 */
import api from "./api";

export const categoriesService = {
  list: () => api.get("/categories").then((r) => r.data),
};
