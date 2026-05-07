import { useState, useEffect } from "react";
import { admService } from "../services/admService";

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

  async function updateCompany(id, formData) {
    setError("");
    setSaving(true);
    try {
      const updated = await admService.updateCompany(id, formData);
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar empresa.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function toggleCompanyActive(id) {
    try {
      const { active } = await admService.toggleCompanyActive(id);
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, user: { ...c.user, active } } : c
        )
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao alterar status da empresa.");
      return false;
    }
  }

  async function resetCompanyPassword(id, newPassword) {
    try {
      await admService.resetCompanyPassword(id, newPassword);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao redefinir senha.");
      return false;
    }
  }

  return {
    companies,
    loading,
    saving,
    error,
    setError,
    createCompany,
    updateCompany,
    toggleCompanyActive,
    resetCompanyPassword,
  };
}
