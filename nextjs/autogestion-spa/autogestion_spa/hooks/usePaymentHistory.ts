"use client";

import { useEffect, useState } from "react";
import { PaymentHistoryItem } from "@/types/payments";
import { getPaymentHistory } from "@/lib/api/payments";
import { useAuth } from "@/context/AuthContext";

type MunicipalSearchSession = {
  searchType: "national" | "foreign" | "legal";
  identifier: string;
};

export function usePaymentHistory() {
  const { generateToken } = useAuth();

  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPaymentHistory() {
      try {
        const storedSession = sessionStorage.getItem("municipalSearch");

        if (!storedSession) {
          setError("No hay una consulta activa.");
          return;
        }

        const session = JSON.parse(storedSession) as MunicipalSearchSession;
        const token = await generateToken();

        const response = await getPaymentHistory(session.identifier, token);

        if (!response.success) {
          setError(
            response.error ?? "No fue posible consultar el histórico de pagos."
          );
          return;
        }

        setPayments(response.payments);
      } catch {
        setError("No fue posible cargar el histórico de pagos.");
      } finally {
        setLoading(false);
      }
    }

    loadPaymentHistory();
  }, [generateToken]);

  return {
    payments,
    loading,
    error,
  };
}