"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { ProcedureRequest } from "@/types/procedureRequest";
import { Pagination } from "@/components/ui/Pagination";

type Props = {
  requests: ProcedureRequest[];
  loading: boolean;
  error: string;
  /** Muestra la columna "Finca" (solo aplica a trámites que requieren finca). */
  showProperty?: boolean;
};

const PAGE_SIZE = 6;

const STATE_STYLES: Record<string, string> = {
  draft: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
};

function StateBadge({ state, label }: { state: string; label: string }) {
  const className = STATE_STYLES[state] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label || state}
    </span>
  );
}

export function ProcedureHistoryTable({
  requests,
  loading,
  error,
  showProperty = false,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));

  // Al cambiar el listado (recarga, filtro o nuevo registro) volvemos a la
  // primera página para mostrar lo más reciente arriba.
  useEffect(() => {
    setCurrentPage(1);
  }, [requests]);

  const paginatedRequests = useMemo(
    () =>
      requests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [requests, currentPage],
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-bold text-[#082b63]">
          Historial de trámites
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Solicitudes registradas a su nombre para este trámite.
        </p>
      </div>

      {loading && (
        <div className="space-y-3 p-5 sm:p-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="m-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:m-6">
          {error}
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="p-6 text-sm text-gray-500">
          Aún no tiene trámites registrados de este tipo.
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-4">N° Trámite</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Finalizado</th>
                  {showProperty && <th className="px-6 py-4">Finca</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedRequests.map((request) => {
                  const showReason =
                    request.state === "cancelled" && !!request.cancelReason;

                  return (
                    <Fragment key={request.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {request.number}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {request.type}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <StateBadge
                            state={request.state}
                            label={request.stateLabel}
                          />
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {request.createDate || "—"}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {request.state === "done"
                            ? request.doneDate || "—"
                            : "—"}
                        </td>

                        {showProperty && (
                          <td className="px-6 py-4 text-gray-600">
                            {request.propertyNumber || "—"}
                          </td>
                        )}
                      </tr>

                      {showReason && (
                        <tr className="bg-rose-50/50">
                          <td
                            colSpan={showProperty ? 6 : 5}
                            className="px-6 py-3 text-sm text-rose-700"
                          >
                            <span className="font-semibold">
                              Motivo de anulación:
                            </span>{" "}
                            {request.cancelReason}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="border-t border-gray-100 px-5 py-5 sm:px-6"
          />
        </>
      )}
    </div>
  );
}
