"use client";

import { ServiceCard } from "./ServiceCard";
import type { Procedure } from "@/types/procedure";

export function ProcedureGrid({ procedures }: { procedures: Procedure[] }) {
  if (procedures.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 text-gray-500">
        No hay trámites disponibles por el momento.
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {procedures.map((procedure) => (
        <ServiceCard
          key={procedure.id}
          title={procedure.title}
          description={procedure.description || "Solicite este trámite en línea."}
          url={`/dashboard/procedures/${procedure.id}`}
          icon={procedure.icon}
          color={procedure.color}
          isExternal={false}
        />
      ))}
    </section>
  );
}
