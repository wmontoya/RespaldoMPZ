"use client";

import { useCallback, useState } from "react";
import { getPropertiesByCitizen } from "@/lib/api/properties";
import { adaptarProperty, type Contribuyente } from "@/types/property";
import { useAuth } from "@/context/AuthContext";

export function useProperties() {
  const { generateToken } = useAuth();

  const [contribuyente, setContribuyente] = useState<Contribuyente | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchProperties = useCallback(
    async (cedula: string) => {
      setLoading(true);
      setError("");
      setContribuyente(null);

      try {
        const token = await generateToken();
        const response = await getPropertiesByCitizen(cedula, token);

        if (!response.success || !response.contribuyente?.length) {
          setError(response.error ?? "No se encontraron propiedades asociadas.");
          return null;
        }

        const data = adaptarProperty(response.contribuyente);

        if (!data) {
          setError("No fue posible procesar la información de propiedades.");
          return null;
        }

        setContribuyente(data);
        setError("");
        return data;
      } catch {
        setError("No fue posible consultar la información de propiedades.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [generateToken],
  );

  return {
    contribuyente,
    loading,
    error,
    searchProperties,
  };
}