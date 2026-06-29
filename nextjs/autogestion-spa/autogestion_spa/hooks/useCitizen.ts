"use client";

import { useState } from "react";
import { Citizen } from "@/types/citizen";
import { getCitizenById } from "@/lib/api/citizen";
import { useAuth } from "@/context/AuthContext";

export function useCitizen() {
  const { generateToken } = useAuth();

  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchCitizen(cedula: string) {
    setLoading(true);
    setError("");

    try {
      const token = await generateToken();
      const response = await getCitizenById(cedula, token);

      if (!response.success || !response.contribuyente) {
        setError(
          response.error ?? "No se encontró información del contribuyente."
        );
        return null;
      }

      setCitizen(response.contribuyente);
      return response.contribuyente;
    } catch {
      setError("No fue posible consultar la información.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    citizen,
    loading,
    error,
    searchCitizen,
  };
}