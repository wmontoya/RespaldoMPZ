"use client";

import { useEffect, useState } from "react";
import { OutstandingPayment } from "@/types/payment";
import { getOutstandingPayments } from "@/lib/api/payments";
import { useAuth } from "@/context/AuthContext";

type MunicipalSearchSession = {
  searchType: "national" | "foreign" | "legal";
  identifier: string;
};

export function usePayments() {
  const { generateToken } = useAuth();

  const [payments, setPayments] = useState<OutstandingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPayments() {
      try {
        const storedSession = sessionStorage.getItem("municipalSearch");

        if (!storedSession) {
          setError("No hay una consulta activa.");
          return;
        }

        const session = JSON.parse(storedSession) as MunicipalSearchSession;
        const token = await generateToken();

        const response = await getOutstandingPayments(session.identifier, token);

        if (!response.success) {
          setError(response.error ?? "No fue posible consultar los pendientes.");
          return;
        }

        setPayments(response.pendientes);
      } catch {
        setError("No fue posible cargar los pagos pendientes.");
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, [generateToken]);

  return {
    payments,
    loading,
    error,
  };
}