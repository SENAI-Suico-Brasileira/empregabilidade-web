import { useState, useEffect } from "react";
import { jobsService } from "../services/jobsService";

/**
 * Busca vagas públicas (status ACTIVE) com filtro opcional por categoria.
 * Re-executa automaticamente quando categoryId muda.
 */
export function useJobs(categoryId) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = categoryId ? { categoryId } : {};
    jobsService
      .list(params)
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [categoryId]);

  return { jobs, loading };
}
