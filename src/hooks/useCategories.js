import { useState, useEffect } from "react";
import { categoriesService } from "../services/categoriesService";

/**
 * Busca e armazena a lista de categorias.
 * Usado no mural (filtro) e nos formulários de vaga.
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesService
      .list()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
