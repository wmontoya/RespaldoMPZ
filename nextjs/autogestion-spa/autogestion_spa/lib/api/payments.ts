import { OutstandingPaymentsResponse } from "@/types/payment";
import { PaymentHistoryResponse } from "@/types/payments";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getOutstandingPayments(
  cedula: string,
  token: string
): Promise<OutstandingPaymentsResponse> {
  const response = await fetch(`${API_URL}/api/v1/yaipan/pendientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ cedula }),
  });

  if (!response.ok) {
    throw new Error(`Error al consultar pendientes (${response.status})`);
  }

  return response.json();
}

export async function getPaymentHistory(
  cedula: string,
  token: string
): Promise<PaymentHistoryResponse> {
  const response = await fetch(`${API_URL}/api/v1/yaipan/payment_history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ cedula }),
  });

  if (!response.ok) {
    throw new Error(`Error al consultar histórico de pagos (${response.status})`);
  }

  return response.json();
}