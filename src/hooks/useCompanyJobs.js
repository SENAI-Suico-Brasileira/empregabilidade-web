import { useState, useEffect } from "react";
import { companyService } from "../services/companyService";

/**
 * Vagas da empresa logada.
 * updateJobStatus atualiza o estado local otimisticamente
 * sem precisar re-buscar toda a lista.
 */
export function useCompanyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyService
      .listJobs()
      .then(setJobs)
      .finally(() => setLoading(false));
  }, []);

  async function updateJobStatus(jobId, status) {
    await companyService.updateJobStatus(jobId, status);
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status } : j))
    );
  }

  return { jobs, loading, updateJobStatus };
}
