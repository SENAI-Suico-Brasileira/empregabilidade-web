import { useState, useEffect, useCallback } from "react";
import { admService } from "../services/admService";

/**
 * Dados e ações do dashboard administrativo.
 * Carrega indicadores e fila de vagas pendentes em paralelo.
 * Aprovação/reprovação atualizam o estado local sem re-buscar tudo.
 */
export function useAdmDashboard() {
  const [indicators, setIndicators] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      admService.getIndicators(),
      admService.listJobs({ status: "PENDING" }),
    ])
      .then(([ind, jobs]) => {
        setIndicators(ind);
        setPendingJobs(jobs);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function approveJob(id) {
    await admService.approveJob(id);
    setPendingJobs((prev) => prev.filter((j) => j.id !== id));
    setIndicators((prev) => ({
      ...prev,
      jobsByStatus: {
        ...prev.jobsByStatus,
        PENDING: (prev.jobsByStatus.PENDING ?? 1) - 1,
        ACTIVE: (prev.jobsByStatus.ACTIVE ?? 0) + 1,
      },
    }));
  }

  async function rejectJob(id, reason) {
    await admService.rejectJob(id, reason);
    setPendingJobs((prev) => prev.filter((j) => j.id !== id));
  }

  return { indicators, pendingJobs, loading, approveJob, rejectJob };
}
