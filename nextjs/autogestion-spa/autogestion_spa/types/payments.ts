export interface PaymentHistoryItem {
  origen: "ACTUAL" | "HISTORICO";
  num_recibo: number;
  fec_envio: string;
  cedula: string;
  nom_cuenta: string;
  periodo: number | string;
  cod_ser_ex: string;
  concepto: string;
  mon_cancel: number;
  mon_intere: number;
  mon_recibo: number;
}

export interface PaymentHistoryResponse {
  success: boolean;
  payments: PaymentHistoryItem[];
  error?: string;
}