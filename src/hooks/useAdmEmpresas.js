import { useState, useEffect } from "react";
import { admService } from "../services/admService";

/**
 * Lista de empresas e criação de nova empresa para o painel admin.
 * Retorna `createCompany` que resolve `true` em sucesso e `false` em erro.
 */
export function useAdmEmpresas() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    admService
      .listCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  async function createCompany(formData) {
    setError("");
    setSaving(true);
    try {
      const data = await admService.createCompany(formData);
      setCompanies((prev) => [
        ...prev,
        { ...data.company, user: data.user, _count: { jobs: 0 } },
      ]);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao cadastrar empresa.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { companies, loading, saving, error, createCompany };
}
