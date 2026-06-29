"use client";

import { useCallback, useEffect, useState } from "react";
import { getProcedureRequests } from "@/lib/api/procedureRequests";
import type { ProcedureRequest } from "@/types/procedureRequest";
import { useAuth } from "@/context/AuthContext";

export function useProcedureRequests(cedula: string, typeId?: number) {
  const { generateToken } = useAuth();

  const [requests, setRequests] = useState<ProcedureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    if (!cedula) {
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = await generateToken();
      const response = await getProcedureRequests(cedula, token, typeId);

      if (!response.success || !response.data) {
        setError(response.error ?? "No se pudo cargar el historial de trámites.");
        return;
      }

      setRequests(response.data);
    } catch {
      setError("No fue posible cargar el historial de trámites.");
    } finally {
      setLoading(false);
    }
  }, [cedula, typeId, generateToken]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return {
    requests,
    loading,
    error,
    reload: loadRequests,
  };
}
