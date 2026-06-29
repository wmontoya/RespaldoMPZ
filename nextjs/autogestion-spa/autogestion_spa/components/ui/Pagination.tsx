"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

type PaginationProps = {
  /** Página actual (base 1). */
  page: number;
  /** Total de páginas. */
  totalPages: number;
  /** Notifica la nueva página seleccionada (base 1). */
  onPageChange: (page: number) => void;
  /** Clases extra para el contenedor (separadores, márgenes, etc.). */
  className?: string;
};

const BUTTON_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Controles de paginación unificados para todo el proyecto.
 * No renderiza nada cuando hay una sola página.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={BUTTON_CLASS}
      >
        <ArrowLeft className="h-4 w-4" />
        Anteriores
      </button>

      <span className="text-sm font-medium text-gray-600">
        Página {page} de {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={BUTTON_CLASS}
      >
        Siguientes
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
