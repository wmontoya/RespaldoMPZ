"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { OutstandingPayment } from "@/types/payment";

interface GroupedPaymentTableProps {
  payments: OutstandingPayment[];
}

type PaymentStatusFilter = "all" | "vencido" | "al cobro" | "pendiente";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(value);
}

function getTotal(payment: OutstandingPayment) {
  return payment.saldo + payment.saldoInteres + payment.montoMulta;
}

function getStatusClass(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "vencido") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (normalizedStatus === "al cobro") {
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }

  return "bg-blue-50 text-blue-700 border-blue-200";
}

export function GroupedPaymentTable({ payments }: GroupedPaymentTableProps) {
  const [openConcept, setOpenConcept] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("all");

  const groupedPayments = useMemo(() => {
    const groups = new Map<string, OutstandingPayment[]>();

    payments.forEach((payment) => {
      const concept = payment.descripcion || "Sin concepto";

      if (!groups.has(concept)) {
        groups.set(concept, []);
      }

      groups.get(concept)?.push(payment);
    });

    return Array.from(groups.entries()).map(([concept, items]) => {
      const subtotal = items.reduce((sum, item) => sum + item.saldo, 0);
      const interests = items.reduce((sum, item) => sum + item.saldoInteres, 0);
      const fines = items.reduce((sum, item) => sum + item.montoMulta, 0);
      const total = items.reduce((sum, item) => sum + getTotal(item), 0);

      return {
        concept,
        items,
        subtotal,
        interests,
        fines,
        total,
        overdueCount: items.filter(
          (item) => item.estado.toLowerCase() === "vencido",
        ).length,
        collectingCount: items.filter(
          (item) => item.estado.toLowerCase() === "al cobro",
        ).length,
        pendingCount: items.filter(
          (item) => item.estado.toLowerCase() === "pendiente",
        ).length,
      };
    });
  }, [payments]);

  function toggleConcept(concept: string) {
    setOpenConcept((current) => (current === concept ? null : concept));
    setStatusFilter("all");
  }

  function getFilteredItems(items: OutstandingPayment[]) {
    if (statusFilter === "all") {
      return items;
    }

    return items.filter((item) => item.estado.toLowerCase() === statusFilter);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-bold text-[#082b63]">
          Detalle de pendientes
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Obligaciones municipales agrupadas por concepto.
        </p>
      </div>

      {/* Vista móvil */}
      <div className="space-y-4 bg-gray-50 p-4 md:hidden">
        {groupedPayments.map((group) => {
          const isOpen = openConcept === group.concept;
          const filteredItems = getFilteredItems(group.items);

          return (
            <article
              key={group.concept}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleConcept(group.concept)}
                className="flex w-full items-start justify-between gap-4 p-4 text-left"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Concepto
                  </p>
                  <h3 className="mt-1 text-base font-bold text-gray-900">
                    {group.concept}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                      {group.overdueCount} vencidos
                    </span>

                    <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                      {group.collectingCount} al cobro
                    </span>

                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {group.pendingCount} pendientes
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-right text-sm font-bold text-[#082b63]">
                    {formatCurrency(group.total)}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-xl bg-[#082b63] px-3 py-1.5 text-xs font-semibold text-white">
                    {isOpen ? "Ocultar" : "Ver"}
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {[
                      { label: "Todo", value: "all" },
                      { label: "Vencido", value: "vencido" },
                      { label: "Al cobro", value: "al cobro" },
                      { label: "Pendiente", value: "pendiente" },
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() =>
                          setStatusFilter(filter.value as PaymentStatusFilter)
                        }
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          statusFilter === filter.value
                            ? "bg-[#082b63] text-white"
                            : "bg-white text-gray-600 hover:bg-blue-50"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {filteredItems.map((payment, index) => (
                      <div
                        key={`${group.concept}-${payment.numeroDocumento}-${payment.numeroCuenta}-${payment.year}-${payment.periodo}-${index}`}
                        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Periodo
                            </p>
                            <p className="mt-1 font-bold text-gray-900">
                              {payment.year}-{payment.periodo}
                            </p>
                          </div>

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                              payment.estado,
                            )}`}
                          >
                            {payment.estado}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-500">Finca</span>
                            <span className="text-right font-medium text-gray-900">
                              {payment.numeroFinca}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-gray-500">Documento</span>
                            <span className="text-right font-medium text-gray-900">
                              {payment.numeroDocumento}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-gray-500">Fecha corte</span>
                            <span className="text-right font-medium text-gray-900">
                              {payment.fechaCorte}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-500">Saldo</span>
                            <span className="text-right font-medium text-gray-900">
                              {formatCurrency(payment.saldo)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-gray-500">Interés</span>
                            <span className="text-right font-medium text-gray-900">
                              {formatCurrency(payment.saldoInteres)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-gray-500">Multa</span>
                            <span className="text-right font-medium text-gray-900">
                              {formatCurrency(payment.montoMulta)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4 border-t border-gray-100 pt-3 text-base font-bold text-[#082b63]">
                            <span>Total</span>
                            <span className="text-right">
                              {formatCurrency(getTotal(payment))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Vista escritorio */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-4">Concepto</th>
              <th className="px-6 py-4 text-center">Vencidos</th>
              <th className="px-6 py-4 text-center">Al cobro</th>
              <th className="px-6 py-4 text-center">Pendientes</th>
              <th className="px-6 py-4 text-center">Registros</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-right">Detalle</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {groupedPayments.map((group) => {
              const isOpen = openConcept === group.concept;
              const filteredItems = getFilteredItems(group.items);

              return (
                <React.Fragment key={group.concept}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {group.concept}
                    </td>

                    <td className="px-6 py-4 text-center text-gray-400">
                      {group.overdueCount}
                    </td>

                    <td className="px-6 py-4 text-center text-gray-400">
                      {group.collectingCount}
                    </td>

                    <td className="px-6 py-4 text-center text-gray-400">
                      {group.pendingCount}
                    </td>

                    <td className="px-6 py-4 text-center text-gray-400">
                      {group.items.length}
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {formatCurrency(group.total)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleConcept(group.concept)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#082b63] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b3b85]"
                      >
                        {isOpen ? "Ocultar" : "Ver detalle"}
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr>
                      <td colSpan={7} className="bg-gray-50 px-6 py-5">
                        <div className="mb-4 flex flex-wrap gap-2">
                          {[
                            { label: "Todo", value: "all" },
                            { label: "Vencido", value: "vencido" },
                            { label: "Al cobro", value: "al cobro" },
                            { label: "Pendiente", value: "pendiente" },
                          ].map((filter) => (
                            <button
                              key={filter.value}
                              type="button"
                              onClick={() =>
                                setStatusFilter(
                                  filter.value as PaymentStatusFilter,
                                )
                              }
                              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                statusFilter === filter.value
                                  ? "bg-[#082b63] text-white"
                                  : "bg-white text-gray-600 hover:bg-blue-50"
                              }`}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                          <table className="min-w-full text-left text-sm">
                            <thead className="bg-white text-xs uppercase tracking-wide text-gray-500">
                              <tr>
                                <th className="px-5 py-3">Periodo</th>
                                <th className="px-5 py-3">Finca</th>
                                <th className="px-5 py-3">Documento</th>
                                <th className="px-5 py-3">Fecha corte</th>
                                <th className="px-5 py-3">Estado</th>
                                <th className="px-5 py-3 text-right">Saldo</th>
                                <th className="px-5 py-3 text-right">
                                  Interés
                                </th>
                                <th className="px-5 py-3 text-right">Multa</th>
                                <th className="px-5 py-3 text-right">Total</th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                              {filteredItems.map((payment, index) => (
                                <tr
                                  key={`${group.concept}-${payment.numeroDocumento}-${payment.numeroCuenta}-${payment.year}-${payment.periodo}-${index}`}
                                >
                                  <td className="px-5 py-3 text-gray-600">
                                    {payment.year}-{payment.periodo}
                                  </td>

                                  <td className="px-5 py-3 text-gray-600">
                                    {payment.numeroFinca}
                                  </td>

                                  <td className="px-5 py-3 text-gray-600">
                                    {payment.numeroDocumento}
                                  </td>

                                  <td className="px-5 py-3 text-gray-600">
                                    {payment.fechaCorte}
                                  </td>

                                  <td className="px-5 py-3">
                                    <span
                                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                                        payment.estado,
                                      )}`}
                                    >
                                      {payment.estado}
                                    </span>
                                  </td>

                                  <td className="px-5 py-3 text-right text-gray-600">
                                    {formatCurrency(payment.saldo)}
                                  </td>

                                  <td className="px-5 py-3 text-right text-gray-600">
                                    {formatCurrency(payment.saldoInteres)}
                                  </td>

                                  <td className="px-5 py-3 text-right text-gray-600">
                                    {formatCurrency(payment.montoMulta)}
                                  </td>

                                  <td className="px-5 py-3 text-right font-bold text-gray-900">
                                    {formatCurrency(getTotal(payment))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}