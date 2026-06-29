//interface creada para los datos de los tipos de tramites
export interface Procedure {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  code: string;
  requiresProperty: boolean;
}

export interface ProceduresResponse {
  success: boolean;
  data?: Procedure[];
  error?: string;
}
