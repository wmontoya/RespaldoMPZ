"use client";

import { ProcedureGrid } from "@/components/dashboard/ProcedureGrid";
import { useProcedures } from "@/hooks/useProcedures";
import { Loading } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProceduresPage() {
  const { procedures, loading, error } = useProcedures();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <EmptyState
        title="No fue posible cargar los trámites"
        description={error}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-[#082b63]">
          Trámites municipales
        </p>

        <h2 className="mt-2 text-xl font-bold text-gray-900">
          Solicitud de trámites
        </h2>

        <p className="mt-3 max-w-5xl text-sm leading-relaxed text-gray-600">
          Seleccione el trámite que desea gestionar. La lista de trámites
          disponibles se actualiza automáticamente según la configuración
          municipal.
        </p>
      </div>

      <ProcedureGrid procedures={procedures} />
    </div>
  );
}
