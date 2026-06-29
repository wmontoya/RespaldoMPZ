"use client";

import { useCallback, useEffect, useState } from "react";
import { getServices } from "@/lib/api/services";
import type { Service } from "@/types/service";
import { useAuth } from "@/context/AuthContext";

export function useServices() {
  const { generateToken } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await generateToken();
      const response = await getServices(token);

      if (!response.success || !response.data) {
        setError(response.error ?? "No se pudieron cargar los servicios.");
        return;
      }

      setServices(response.data);
    } catch {
      setError("No fue posible cargar los servicios.");
    } finally {
      setLoading(false);
    }
  }, [generateToken]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return {
    services,
    loading,
    error,
    reload: loadServices,
  };
}
