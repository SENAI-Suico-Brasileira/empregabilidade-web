import { useState, useEffect } from "react";

/**
 * Retarda a atualização de um valor pelo tempo especificado.
 * Útil para evitar requisições a cada tecla em campos de busca.
 */
export function useDebounce(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
