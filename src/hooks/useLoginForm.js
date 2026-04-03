import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

/**
 * Gerencia o formulário de login para qualquer área (admin ou empresa).
 *
 * @param {Object} options
 * @param {"ADMIN"|"COMPANY"} options.expectedRole - Role necessário para este login
 * @param {string} options.redirectTo - Rota de destino após login bem-sucedido
 * @param {string} options.altLoginPath - Link para o outro tipo de login (exibido no erro)
 */
export function useLoginForm({ expectedRole, redirectTo, altLoginPath }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(form);

      if (data.user.role !== expectedRole) {
        setError(`Acesso negado. Utilize ${altLoginPath}.`);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  }

  return { form, error, loading, handleChange, handleSubmit };
}
