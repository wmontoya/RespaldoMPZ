import * as LucideIcons from "lucide-react";
import { LayoutGrid, type LucideIcon } from "lucide-react";

/**
 * Resuelve un icono de lucide-react a partir de su nombre en texto plano
 * (ej: "Building2"). Si el nombre no existe, devuelve un icono por defecto.
 */
export function resolveIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[name] ?? LayoutGrid;
}
