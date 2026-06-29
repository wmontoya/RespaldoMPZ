export interface Service {
  id: number;
  title: string;
  description: string;
  color: string;
  icon: string;
  url: string;
  isExternal: boolean;
}

export interface ServicesResponse {
  success: boolean;
  data?: Service[];
  error?: string;
}
