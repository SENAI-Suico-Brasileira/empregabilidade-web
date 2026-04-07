import { useState, useEffect } from "react";
import { jobsService } from "../services/jobsService";

/**
 * Busca vagas públicas (status ACTIVE).
 * Re-executa quando categoryId ou search mudam.
 */
export function useJobs(categoryId, search) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (categoryId) params.categoryId = categoryId;
    if (search?.trim()) params.search = search.trim();

    jobsService
      .list(params)
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [categoryId, search]);

  return { jobs, loading };
}
