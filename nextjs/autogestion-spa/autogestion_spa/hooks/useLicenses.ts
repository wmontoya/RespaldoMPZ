"use client";

import { useCallback, useState } from "react";
import { getLicensesById } from "@/lib/api/licenses";
import { adaptarLicencias, type BusinessLicense } from "@/types/license";
import { useAuth } from "@/context/AuthContext";

export function useLicenses() {
  const { generateToken } = useAuth();

  const [licenses, setLicenses] = useState<BusinessLicense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchLicenses = useCallback(
    async (cedula: string) => {
      setLoading(true);
      setError("");
      setLicenses([]);

      try {
        const token = await generateToken();
        const response = await getLicensesById(cedula, token);

        if (!response.success) {
          setError(response.error ?? "No fue posible consultar las patentes.");
          return [];
        }

        const data = adaptarLicencias(response.contribuyente ?? []);

        setLicenses(data);
        setError("");

        return data;
      } catch {
        setError("No fue posible consultar la información de patentes.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [generateToken],
  );

  return {
    licenses,
    loading,
    error,
    searchLicenses,
  };
}