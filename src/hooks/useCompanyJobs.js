import { useState, useEffect } from "react";
import { companyService } from "../services/companyService";

/**
 * Vagas da empresa logada.
 * updateJobStatus atualiza o estado local sem re-buscar toda a lista.
 * extraData: { filledBy } para COMPLETED, { pauseReason } para INACTIVE
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

  async function updateJobStatus(jobId, status, extraData = {}) {
    await companyService.updateJobStatus(jobId, status, extraData);
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status, ...extraData } : j))
    );
  }

  return { jobs, loading, updateJobStatus };
}
