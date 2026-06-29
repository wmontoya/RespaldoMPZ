// SERVICIOS DE INTEGRACIÓN CON LA API DE TRÁMITES MUNICIPALES.
//
// CENTRALIZA LAS LLAMADAS HTTP UTILIZADAS POR EL FRONTEND PARA CONSULTAR
// EL HISTORIAL DE SOLICITUDES, REGISTRAR NUEVOS TRÁMITES Y GENERAR
// ESTADOS DE CUENTA. ADMINISTRA EL ENVÍO DE DATOS Y TOKENS DE
// AUTENTICACIÓN, ASÍ COMO EL CONSUMO DE LOS ENDPOINTS EXPUESTOS POR EL
// BACKEND DE AUTOGESTIÓN.
import type {
  AccountStatementPayload,
  AccountStatementResponse,
  CreateProcedureRequestPayload,
  CreateProcedureRequestResponse,
  ProcedureRequestsResponse,
} from "@/types/procedureRequest";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProcedureRequests(
  cedula: string,
  token: string,
  typeId?: number,
): Promise<ProcedureRequestsResponse> {
  const response = await fetch(`${API_URL}/api/v1/yaipan/procedure_requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      cedula,
      ...(typeId ? { type_id: typeId } : {}),
    }),
  });

  return response.json();
}

export async function createProcedureRequest(
  payload: CreateProcedureRequestPayload,
  token: string,
): Promise<CreateProcedureRequestResponse> {
  const response = await fetch(
    `${API_URL}/api/v1/yaipan/procedure_request_create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(payload),
    },
  );

  return response.json();
}

export async function requestAccountStatement(
  payload: AccountStatementPayload,
  token: string,
): Promise<AccountStatementResponse> {
  const response = await fetch(`${API_URL}/api/v1/yaipan/account_statement`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      cedula: payload.cedula,
      email: payload.email,
      phone: payload.phone,
      statement_type: payload.statementType,
    }),
  });

  return response.json();
}
