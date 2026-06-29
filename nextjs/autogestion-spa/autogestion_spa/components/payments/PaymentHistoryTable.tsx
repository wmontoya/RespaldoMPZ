"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { PaymentHistoryItem } from "@/types/payments";
import { Pagination } from "@/components/ui/Pagination";

interface PaymentHistoryTableProps {
  payments: PaymentHistoryItem[];
}

interface PaymentHistoryConceptGroup {
  concepto: string;
  total: number;
  registros: number;
  detalles: PaymentHistoryItem[];
}

interface ReceiptSummary {
  subtotal: number;
  interests: number;
  discounts: number;
  total: number;
}

interface PaymentHistoryReceiptGroup {
  num_recibo: number;
  fec_envio: string;
  nom_cuenta: string;
  origen: "ACTUAL" | "HISTORICO";
  resumen: ReceiptSummary;
  conceptos: PaymentHistoryConceptGroup[];
}

const ITEMS_PER_PAGE = 5;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(value ?? 0);
}

function formatDate(value: string) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatPeriod(value: string | number) {
  const text = String(value);

  if (!text.includes(".")) return text;

  const [year, period] = text.split(".");
  return `${period.padStart(2, "0")}° - ${year}`;
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isInterestConcept(concepto: string) {
  return normalizeText(concepto).includes("interes");
}

function isDiscountConcept(concepto: string) {
  const normalized = normalizeText(concepto);
  return normalized.includes("desc") || normalized.includes("descuento");
}

function getLineTotal(payment: PaymentHistoryItem) {
  return (payment.mon_cancel ?? 0) + (payment.mon_intere ?? 0);
}

function calculateReceiptSummary(details: PaymentHistoryItem[]): ReceiptSummary {
  const normalItems = details.filter(
    (item) =>
      !isInterestConcept(item.concepto) && !isDiscountConcept(item.concepto),
  );

  const discountItems = details.filter((item) =>
    isDiscountConcept(item.concepto),
  );

  const interestItems = details.filter((item) =>
    isInterestConcept(item.concepto),
  );

  const subtotal = normalItems.reduce(
    (sum, item) => sum + (item.mon_cancel ?? 0),
    0,
  );

  const interestsFromLines = normalItems.reduce(
    (sum, item) => sum + (item.mon_intere ?? 0),
    0,
  );

  const interestsFromConcept = interestItems.reduce(
    (sum, item) => sum + (item.mon_cancel ?? 0),
    0,
  );

  const interests =
    interestsFromLines > 0 ? interestsFromLines : interestsFromConcept;

  const discounts = Math.abs(
    discountItems.reduce((sum, item) => sum + (item.mon_cancel ?? 0), 0),
  );

  const total = subtotal + interests - discounts;

  return {
    subtotal,
    interests,
    discounts,
    total,
  };
}

function sortDetails(details: PaymentHistoryItem[]) {
  return [...details].sort((a, b) => {
    const conceptSort = a.concepto.localeCompare(b.concepto, "es");

    if (conceptSort !== 0) return conceptSort;

    return String(a.periodo).localeCompare(String(b.periodo), "es", {
      numeric: true,
    });
  });
}

function groupByConcept(
  details: PaymentHistoryItem[],
): PaymentHistoryConceptGroup[] {
  const groups = new Map<string, PaymentHistoryConceptGroup>();

  sortDetails(details).forEach((payment) => {
    const concept = payment.concepto || "Sin concepto";

    if (isInterestConcept(concept)) {
      return;
    }

    const existing = groups.get(concept);

    if (!existing) {
      groups.set(concept, {
        concepto: concept,
        total: getLineTotal(payment),
        registros: 1,
        detalles: [payment],
      });

      return;
    }

    existing.total += getLineTotal(payment);
    existing.registros += 1;
    existing.detalles.push(payment);
  });

  return Array.from(groups.values()).sort((a, b) =>
    a.concepto.localeCompare(b.concepto, "es"),
  );
}

function groupPayments(
  payments: PaymentHistoryItem[],
): PaymentHistoryReceiptGroup[] {
  const receipts = new Map<number, PaymentHistoryItem[]>();

  payments.forEach((payment) => {
    const existing = receipts.get(payment.num_recibo);

    if (!existing) {
      receipts.set(payment.num_recibo, [payment]);
      return;
    }

    existing.push(payment);
  });

  return Array.from(receipts.entries()).map(([num_recibo, details]) => {
    const first = details[0];

    return {
      num_recibo,
      fec_envio: first.fec_envio,
      nom_cuenta: first.nom_cuenta,
      origen: first.origen,
      resumen: calculateReceiptSummary(details),
      conceptos: groupByConcept(details),
    };
  });
}

export default function PaymentHistoryTable({
  payments,
}: PaymentHistoryTableProps) {
  const [openReceipt, setOpenReceipt] = useState<number | null>(null);
  const [openConcept, setOpenConcept] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const groupedPayments = useMemo(() => groupPayments(payments), [payments]);

  const totalPages = Math.ceil(groupedPayments.length / ITEMS_PER_PAGE);

  const paginatedGroups = groupedPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  function toggleReceipt(receipt: number) {
    setOpenReceipt((current) => {
      const next = current === receipt ? null : receipt;
      setOpenConcept(null);
      return next;
    });
  }

  function toggleConcept(receipt: number, concept: string) {
    const key = `${receipt}-${concept}`;
    setOpenConcept((current) => (current === key ? null : key));
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-bold text-[#082b63]">
          Detalle de pagos realizados
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Pagos municipales agrupados por recibo, concepto y período.
        </p>
      </div>

      {/* Vista móvil */}
      <div className="space-y-4 bg-gray-50 p-4 md:hidden">
        {paginatedGroups.map((receipt) => {
          const isReceiptOpen = openReceipt === receipt.num_recibo;

          return (
            <article
              key={receipt.num_recibo}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleReceipt(receipt.num_recibo)}
                className="flex w-full items-start justify-between gap-4 p-4 text-left"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Recibo
                  </p>

                  <h3 className="mt-1 text-base font-bold text-gray-900">
                    N° {receipt.num_recibo}
                  </h3>

                  <p className="mt-2 text-sm text-gray-600">
                    {formatDate(receipt.fec_envio)}
                  </p>

                  <p className="mt-1 truncate text-sm text-gray-500">
                    {receipt.nom_cuenta}
                  </p>

                  <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#082b63]">
                    {receipt.origen}
                  </span>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-right text-sm font-bold text-[#082b63]">
                    {formatCurrency(receipt.resumen.total)}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-xl bg-[#082b63] px-3 py-1.5 text-xs font-semibold text-white">
                    {isReceiptOpen ? "Ocultar" : "Ver"}
                    {isReceiptOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                </div>
              </button>

              {isReceiptOpen && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(receipt.resumen.subtotal)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="flex items-center gap-2 text-gray-500">
                          Intereses
                          <span className="group relative">
                            <Info className="h-4 w-4 cursor-help text-[#082b63]" />
                            <span className="pointer-events-none absolute left-0 top-6 z-20 hidden w-64 rounded-xl border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-600 shadow-lg group-hover:block">
                              Los intereses se muestran consolidados para evitar
                              duplicidad.
                            </span>
                          </span>
                        </span>

                        <span className="font-semibold text-gray-900">
                          {formatCurrency(receipt.resumen.interests)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Descuento</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(receipt.resumen.discounts)}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between gap-4 border-t border-gray-100 pt-3 text-base font-bold text-[#082b63]">
                        <span>Total</span>
                        <span>{formatCurrency(receipt.resumen.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {receipt.conceptos.map((concept) => {
                      const conceptKey = `${receipt.num_recibo}-${concept.concepto}`;
                      const isConceptOpen = openConcept === conceptKey;

                      return (
                        <div
                          key={conceptKey}
                          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleConcept(
                                receipt.num_recibo,
                                concept.concepto,
                              )
                            }
                            className="flex w-full items-start justify-between gap-4 text-left"
                          >
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Concepto
                              </p>
                              <h4 className="mt-1 font-bold text-gray-900">
                                {concept.concepto}
                              </h4>
                              <p className="mt-1 text-sm text-gray-500">
                                {concept.registros} registro
                                {concept.registros === 1 ? "" : "s"}
                              </p>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <span className="text-right font-bold text-[#082b63]">
                                {formatCurrency(concept.total)}
                              </span>

                              {isConceptOpen ? (
                                <ChevronDown className="h-5 w-5 text-[#082b63]" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-[#082b63]" />
                              )}
                            </div>
                          </button>

                          {isConceptOpen && (
                            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                              {concept.detalles.map((payment, index) => (
                                <div
                                  key={`${payment.num_recibo}-${payment.cod_ser_ex}-${payment.periodo}-${index}`}
                                  className="flex justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3 text-sm"
                                >
                                  <span className="text-gray-500">
                                    {formatPeriod(payment.periodo)}
                                  </span>

                                  <span className="font-semibold text-gray-900">
                                    {formatCurrency(getLineTotal(payment))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
              <th className="px-6 py-4">Recibo</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Cancelado por</th>
              <th className="px-6 py-4 text-center">Origen</th>
              <th className="px-6 py-4 text-right">Detalle</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedGroups.map((receipt) => {
              const isReceiptOpen = openReceipt === receipt.num_recibo;

              return (
                <React.Fragment key={receipt.num_recibo}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {receipt.num_recibo}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(receipt.fec_envio)}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {receipt.nom_cuenta}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#082b63]">
                        {receipt.origen}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleReceipt(receipt.num_recibo)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#082b63] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b3b85]"
                      >
                        {isReceiptOpen ? "Ocultar" : "Ver detalle"}
                        {isReceiptOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {isReceiptOpen && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 px-6 py-5">
                        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-5">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Recibo N°
                              </p>
                              <p className="mt-1 text-lg font-bold text-gray-900">
                                {receipt.num_recibo}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Fecha
                              </p>
                              <p className="mt-1 font-medium text-gray-900">
                                {formatDate(receipt.fec_envio)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Cancelado por
                              </p>
                              <p className="mt-1 font-medium text-gray-900">
                                {receipt.nom_cuenta}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 rounded-xl bg-gray-50 p-4">
                            <div className="flex justify-between py-1 text-sm">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(receipt.resumen.subtotal)}
                              </span>
                            </div>

                            <div className="flex justify-between py-1 text-sm">
                              <span className="flex items-center gap-2 text-gray-600">
                                Intereses
                                <span className="group relative">
                                  <Info className="h-4 w-4 cursor-help text-[#082b63]" />

                                  <span className="pointer-events-none absolute left-0 top-6 z-20 hidden w-72 rounded-xl border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-600 shadow-lg group-hover:block">
                                    Los intereses pueden venir registrados como
                                    rubro independiente o como monto asociado al
                                    concepto original. Para evitar duplicidad,
                                    se muestran consolidados en esta línea.
                                  </span>
                                </span>
                              </span>

                              <span className="font-semibold text-gray-900">
                                {formatCurrency(receipt.resumen.interests)}
                              </span>
                            </div>

                            <div className="flex justify-between py-1 text-sm">
                              <span className="text-gray-600">Descuento</span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(receipt.resumen.discounts)}
                              </span>
                            </div>

                            <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">
                              <span className="font-bold text-gray-900">
                                Total
                              </span>
                              <span className="text-lg font-bold text-[#082b63]">
                                {formatCurrency(receipt.resumen.total)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                          <table className="min-w-full text-left text-sm">
                            <thead className="bg-white text-xs uppercase tracking-wide text-gray-500">
                              <tr>
                                <th className="px-5 py-3">Concepto</th>
                                <th className="px-5 py-3 text-center">
                                  Registros
                                </th>
                                <th className="px-5 py-3 text-right">Total</th>
                                <th className="px-5 py-3 text-right">
                                  Detalle
                                </th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                              {receipt.conceptos.map((concept) => {
                                const conceptKey = `${receipt.num_recibo}-${concept.concepto}`;
                                const isConceptOpen =
                                  openConcept === conceptKey;

                                return (
                                  <React.Fragment key={conceptKey}>
                                    <tr>
                                      <td className="px-5 py-3 font-semibold text-gray-900">
                                        {concept.concepto}
                                      </td>

                                      <td className="px-5 py-3 text-center text-gray-500">
                                        {concept.registros}
                                      </td>

                                      <td className="px-5 py-3 text-right font-bold text-gray-900">
                                        {formatCurrency(concept.total)}
                                      </td>

                                      <td className="px-5 py-3 text-right">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleConcept(
                                              receipt.num_recibo,
                                              concept.concepto,
                                            )
                                          }
                                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#082b63] transition hover:bg-gray-50"
                                        >
                                          {isConceptOpen
                                            ? "Ocultar"
                                            : "Ver detalle"}
                                          {isConceptOpen ? (
                                            <ChevronDown className="h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                        </button>
                                      </td>
                                    </tr>

                                    {isConceptOpen && (
                                      <tr>
                                        <td
                                          colSpan={4}
                                          className="bg-gray-50 px-5 py-4"
                                        >
                                          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                            <table className="min-w-full text-left text-sm">
                                              <thead className="bg-white text-xs uppercase tracking-wide text-gray-500">
                                                <tr>
                                                  <th className="px-5 py-3">
                                                    Período
                                                  </th>
                                                  <th className="px-5 py-3 text-right">
                                                    Total pagado
                                                  </th>
                                                </tr>
                                              </thead>

                                              <tbody className="divide-y divide-gray-100">
                                                {concept.detalles.map(
                                                  (payment, index) => (
                                                    <tr
                                                      key={`${payment.num_recibo}-${payment.cod_ser_ex}-${payment.periodo}-${index}`}
                                                    >
                                                      <td className="px-5 py-3 text-gray-600">
                                                        {formatPeriod(
                                                          payment.periodo,
                                                        )}
                                                      </td>

                                                      <td className="px-5 py-3 text-right font-medium text-gray-900">
                                                        {formatCurrency(
                                                          getLineTotal(payment),
                                                        )}
                                                      </td>
                                                    </tr>
                                                  ),
                                                )}
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
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="px-5 py-5 sm:px-6"
      />
    </div>
  );
}