// DEFINICIÓN DE TIPOS E INTERFACES PARA LA GESTIÓN DE TRÁMITES MUNICIPALES.
//
// CONTIENE LAS ESTRUCTURAS DE DATOS UTILIZADAS POR EL FRONTEND PARA
// CONSULTAR EL HISTORIAL DE SOLICITUDES, REGISTRAR NUEVOS TRÁMITES Y
// GENERAR ESTADOS DE CUENTA. DEFINE LOS PAYLOADS Y RESPUESTAS DE LAS
// API, GARANTIZANDO EL TIPADO Y LA CONSISTENCIA DE LA INFORMACIÓN
// INTERCAMBIADA ENTRE EL FRONTEND Y EL BACKEND.
export interface ProcedureRequest {
  id: number;
  number: string;
  type: string;
  state: string;
  stateLabel: string;
  createDate: string;
  doneDate: string;
  cancelReason: string;
  propertyNumber: string;
}

export interface ProcedureRequestsResponse {
  success: boolean;
  data?: ProcedureRequest[];
  error?: string;
}

export interface CreateProcedureRequestPayload {
  cedula: string;
  email: string;
  phone: string;
  type_id: number;
  property_number?: string;
}

export interface CreateProcedureRequestResponse {
  success: boolean;
  data?: { id: number; number: string; state: string };
  error?: string;
}

// Estado de Cuenta (trámite con code "account_statement")
export type AccountStatementType = "vencido" | "al_cobro" | "total";

export interface AccountStatementPayload {
  cedula: string;
  email: string;
  phone: string;
  statementType: AccountStatementType;
}

export interface AccountStatementResponse {
  success: boolean;
  /** false cuando no existen saldos del tipo solicitado. */
  hasData?: boolean;
  number?: string | null;
  message?: string;
  error?: string;
}
