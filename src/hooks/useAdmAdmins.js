import { useState, useEffect } from "react";
import { admService } from "../services/admService";

export function useAdmAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    admService
      .listAdmins()
      .then(setAdmins)
      .finally(() => setLoading(false));
  }, []);

  async function createAdmin(formData) {
    setError("");
    setSaving(true);
    try {
      const admin = await admService.createAdmin(formData);
      setAdmins((prev) => [...prev, admin].sort((a, b) => a.name.localeCompare(b.name)));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao cadastrar administrador.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function toggleAdminActive(id) {
    try {
      const { active } = await admService.toggleAdminActive(id);
      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active } : a))
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao alterar status do administrador.");
      return false;
    }
  }

  async function resetAdminPassword(id, newPassword) {
    try {
      await admService.resetAdminPassword(id, newPassword);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao redefinir senha.");
      return false;
    }
  }

  return {
    admins,
    loading,
    saving,
    error,
    setError,
    createAdmin,
    toggleAdminActive,
    resetAdminPassword,
  };
}
