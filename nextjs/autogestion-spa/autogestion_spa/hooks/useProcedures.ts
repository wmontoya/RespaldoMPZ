"use client";

import { useCallback, useEffect, useState } from "react";
import { getProcedures } from "@/lib/api/procedures";
import type { Procedure } from "@/types/procedure";
import { useAuth } from "@/context/AuthContext";

export function useProcedures() {
  const { generateToken } = useAuth();

  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProcedures = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await generateToken();
      const response = await getProcedures(token);

      if (!response.success || !response.data) {
        setError(response.error ?? "No se pudieron cargar los trámites.");
        return;
      }

      setProcedures(response.data);
    } catch {
      setError("No fue posible cargar los trámites.");
    } finally {
      setLoading(false);
    }
  }, [generateToken]);

  useEffect(() => {
    loadProcedures();
  }, [loadProcedures]);

  return {
    procedures,
    loading,
    error,
    reload: loadProcedures,
  };
}
