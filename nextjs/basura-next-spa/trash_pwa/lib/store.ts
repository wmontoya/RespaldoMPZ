import { create } from "zustand"

export interface IterationGroup  {
  iteration: string
  days: string[]
  quincenal_dates: string[]
}

export interface WasteTypeGroup  {
  waste_type: string
  iterations: IterationGroup[]
}

export interface  RouteSector  {
  route: Route
  sector: string
  waste_types: WasteTypeGroup[]
}

export interface Route {
  id: string
  name: string
  services: {
    trash: string[]
    recycling: string[]
    organic: string[]
  }
  days: string[]
  sectors: string[]
  color: string
  coordinates: [number, number][]
  description: string,
  selectedSector: string
}

export interface Propiedad {
  direccion: string
  zona: string
  tarifa: number
  unidadesHabitacionales: number
  periodosPendientes: {
    periodo: string
    fechaCorte: string
    monto: number
  }[]
}

export interface Ciudadano {
  cedula: string
  nombre: string
  propiedades: Propiedad[]
}

export interface Queja {
  id: string
  cedula: string
  nombre: string
  tipo: string
  descripcion: string
  fecha: string
  estado: "pendiente" | "en-revision" | "resuelta" | "rechazada"
  respuesta?: string
}

interface AppState {
  selectRoute: Route | null
  ciudadano: Ciudadano | null
  quejas: Queja[]
  theme: "light" | "dark"
  currentPage: string
  setSelectRoute: (route: Route | null) => void
  setCiudadano: (ciudadano: Ciudadano | null) => void
  addQueja: (queja: Queja) => void
  setQuejas: (quejas: Queja[]) => void
  toggleTheme: () => void
  setCurrentPage: (page: string) => void
}

export const useStore = create<AppState>((set) => ({
  selectRoute: null,
  ciudadano: null,
  quejas: [],
  theme: "light",
  currentPage: "/",
  setSelectRoute: (route) => set({ selectRoute: route }),
  setCiudadano: (ciudadano) => set({ ciudadano: ciudadano }),
  addQueja: (queja) => set((state) => ({ quejas: [queja, ...state.quejas] })),
  setQuejas: (quejas) => set({ quejas }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
  setCurrentPage: (page) => set({ currentPage: page }),
}))

export interface Response {
    success: boolean;
    message: string;
    data?: any;
  }

const STORAGE_KEY = "selected_routes";
const ID_SUBCRIPTION = "id_subscription";
const CODE_SUBCRIPTION = "code_subscription";

export const setCodeSubscription = (value: string) => {
  if (!value) {
    localStorage.removeItem(CODE_SUBCRIPTION);
    return;
  }
  localStorage.setItem(CODE_SUBCRIPTION, value);
};

export const setIdSubscription = (value: string) => {
  if (!value) {
    localStorage.removeItem(ID_SUBCRIPTION);
    return;
  }
  localStorage.setItem(ID_SUBCRIPTION, value);
};

export const getSubscriptionCode = (): string => {
  const data = localStorage.getItem(CODE_SUBCRIPTION);
  if (!data || data === "undefined" || data === "null") { return ""; }
  return data;
};

export const getSubscriptionId = (): string => {
  const data = localStorage.getItem(ID_SUBCRIPTION);
  if (!data || data === "undefined" || data === "null") { return ""; }
  return data;
};


export const getSelectedRoutes = (): string[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const isRouteSubscribed = (routeId: string) => {
  return getSelectedRoutes().includes(routeId);
};

export const toggleRouteSubscription = (routeId: string) => {
  const routes = getSelectedRoutes();

  if (routes.includes(routeId)) {
    const updated = routes.filter(id => id !== routeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return false; // desuscrito
  } else {
    routes.push(routeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
    return true; // suscrito
  }
};

export const getSubscribedRoutes = (): string[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSubscribedRoutes = (routes: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
};
