export interface OutstandingPayment {
  codigoServicio: string;
  tipoCobro: string;
  year: string;
  periodo: string;
  fechaCorte: string;
  monto: number;
  saldo: number;
  saldoInteres: number;
  estado: "vencido" | "al cobro" | "pendiente" | string;
  descripcion: string;
  auxiliarContable: string;
  numeroCuenta: number;
  tipoTransaccion: string;
  numeroDocumento: string;
  montoMulta: number;
  numeroFinca: string;
}

export interface OutstandingPaymentsResponse {
  success: boolean;
  pendientes: OutstandingPayment[];
  error?: string;
}