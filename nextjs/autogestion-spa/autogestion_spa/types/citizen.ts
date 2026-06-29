export interface Citizen {
  cedula_persona: string;
  nombre_completo: string;
  tipo_cedula: string;
  direccion_principal: string;
  telefono: string | null;
  correo_electronico: string | null;
  ultima_actualizacion: string | null;
}

export interface CitizenResponse {
  success: boolean;
  contribuyente: Citizen | null;
  error?: string;
}