"use client";

import PaymentHistoryTable from "@/components/payments/PaymentHistoryTable";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";
import { Loading } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";

export default function PaymentHistoryPage() {
  const { payments, loading, error } = usePaymentHistory();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <EmptyState
        title="No fue posible cargar el histórico de pagos"
        description={error}
      />
    );
  }

  if (payments.length === 0) {
    return (
      <EmptyState
        title="Sin pagos registrados"
        description="No se encontraron pagos registrados para este contribuyente."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-[#082b63]">
          Mi histórico de pagos
        </p>

        <h2 className="mt-2 text-xl font-bold text-gray-900">
          Pagos municipales realizados
        </h2>

        <p className="mt-3 max-w-5xl text-sm leading-relaxed text-gray-600">
          En esta sección puede consultar los pagos registrados a su nombre,
          incluyendo recibos, fechas, conceptos, periodos, montos e intereses
          asociados en el sistema municipal.
        </p>
      </div>

      <PaymentHistoryTable payments={payments} />
    </div>
  );
}