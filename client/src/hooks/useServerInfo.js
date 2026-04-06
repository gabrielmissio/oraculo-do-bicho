import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/constants';

/**
 * Fetches the server's discovery endpoint once and caches the result.
 * Returns live payment/network info without requiring the env var to be correct.
 */
let cache = null;

export function useServerInfo() {
  const [data, setData] = useState(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      setData(cache);
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/`)
      .then((r) => r.json())
      .then((json) => {
        cache = json;
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const pagamentos = data?.pagamentos;

  return {
    info: data,
    loading,
    // Active network(s) — handles both `rede` (singular) and `redes` (array) formats
    networks: pagamentos?.redes ?? (pagamentos?.rede ? [pagamentos.rede] : []),
    paymentActive: pagamentos?.ativo ?? false,
  };
}
