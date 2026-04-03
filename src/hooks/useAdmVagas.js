import { useState, useEffect, useCallback } from "react";
import { admService } from "../services/admService";

/**
 * Lista de todas as vagas para o painel admin com filtro por status.
 * Re-busca ao trocar o filtro. Aprovação/reprovação re-carregam a lista.
 */
export function useAdmVagas() {
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    admService
      .listJobs(params)
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function approveJob(id) {
    await admService.approveJob(id);
    load();
  }

  async function rejectJob(id, reason) {
    await admService.rejectJob(id, reason);
    load();
  }

  return { jobs, loading, statusFilter, setStatusFilter, approveJob, rejectJob };
}
