"use client";

import { usePayments } from "@/hooks/usePayments";
import { OutstandingBalanceCard } from "@/components/payments/OutstandingBalanceCard";
import { GroupedPaymentTable } from "@/components/payments/GroupedPaymentTable";
import { Loading } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";

export default function OutstandingPaymentsPage() {
  const { payments, loading, error } = usePayments();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <EmptyState
        title="No fue posible cargar los pendientes"
        description={error}
      />
    );
  }

  if (payments.length === 0) {
    return (
      <EmptyState
        title="Sin pendientes de pago"
        description="No se encontraron obligaciones municipales pendientes para este contribuyente."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-[#082b63]">
          Mis pendientes de pago
        </p>

        <h2 className="mt-2 text-xl font-bold text-gray-900">
          Estado de obligaciones municipales
        </h2>

        <p className="mt-3 max-w-5xl text-sm leading-relaxed text-gray-600">
          En esta sección puede consultar los montos pendientes asociados a su
          identificación, incluyendo bienes inmuebles, intereses, multas y
          periodos registrados en el sistema municipal.
        </p>
      </div>

      <OutstandingBalanceCard payments={payments} />

      <GroupedPaymentTable payments={payments} /> 
    </div>
  );
}