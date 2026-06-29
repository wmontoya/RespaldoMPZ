import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function getIdentificationTypeLabel(type: string) {
  const types: Record<string, string> = {
    "01": "Nacional",
    "02": "Extranjera",
    "03": "Jurídica",
  };

  return types[type] ?? "No especificado";
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tipos auxiliares
export type Maybe<T> = T | null | undefined;

// Funciones para formatear valores específicos
export function formatArea(value: Maybe<string | number>) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return value;
  }

  return `${value} m²`;
}

export function formatPercent(value: Maybe<string | number>) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return value;
  }

  return `${value}%`;
}

export function formatCurrency(value: Maybe<string | number>) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return value;
  }

  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(Number(value));
}

export function formatDateOnly(value: Maybe<string>) {
  if (!value) return value;

  return value.split(" ")[0];
}

//Funciones para formatear valores de estados de patentes y licencias
export function formatStatusFlags(
  estados: Array<{
    value: string | null | undefined;
    label: string;
  }>
) {
  const activos = estados
    .filter((estado) => String(estado.value).toUpperCase() === "S")
    .map((estado) => estado.label);

  return activos.length > 0
    ? activos.join(", ")
    : "Sin información registrada";
}

