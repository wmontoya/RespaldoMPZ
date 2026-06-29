// PÁGINA DE DETALLE DE TRÁMITES MUNICIPALES.
//
// MUESTRA LA INFORMACIÓN DE UN TRÁMITE ESPECÍFICO SELECCIONADO POR EL
// CIUDADANO, PERMITIENDO REGISTRAR NUEVAS SOLICITUDES Y CONSULTAR SU
// HISTORIAL. CARGA LOS DATOS DEL TRÁMITE, LA SESIÓN DEL CONTRIBUYENTE
// Y LAS SOLICITUDES ASOCIADAS, PRESENTANDO DIFERENTES INTERFACES SEGÚN
// EL TIPO DE TRÁMITE.
//
// PARA EL TRÁMITE DE ESTADO DE CUENTA SE MUESTRA UN FORMULARIO ESPECIAL
// QUE GENERA Y ENVÍA EL DOCUMENTO DE FORMA AUTOMÁTICA. PARA LOS DEMÁS
// TRÁMITES SE HABILITA EL REGISTRO DE NUEVAS SOLICITUDES Y LA CONSULTA
// DEL HISTORIAL DE GESTIONES REALIZADAS POR EL CONTRIBUYENTE.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useProcedures } from "@/hooks/useProcedures";
import { useProcedureRequests } from "@/hooks/useProcedureRequests";
import { useCitizenSession } from "@/hooks/useCitizenSession";
import { resolveIcon } from "@/lib/icons";
import { Loading } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProcedureRequestForm } from "@/components/procedures/ProcedureRequestForm";
import { ProcedureHistoryTable } from "@/components/procedures/ProcedureHistoryTable";
import { AccountStatementForm } from "@/components/procedures/AccountStatementForm";

const DEFAULT_COLOR = "#082b63";

export default function ProcedureDetailPage() {
  const params = useParams<{ id: string }>();
  const parsedId = Number(params?.id);
  const typeId = Number.isFinite(parsedId) ? parsedId : undefined;

  const { procedures, loading, error } = useProcedures();
  const { cedula, loaded: sessionLoaded } = useCitizenSession();

  // Número de finca precargado (ej. al venir desde Bienes Inmuebles con
  // ?finca=...). Se lee del lado del cliente para no requerir Suspense.
  const [initialFinca, setInitialFinca] = useState("");
  useEffect(() => {
    const finca = new URLSearchParams(window.location.search).get("finca");
    if (finca) {
      setInitialFinca(finca);
    }
  }, []);
  const {
    requests,
    loading: loadingRequests,
    error: errorRequests,
    reload,
  } = useProcedureRequests(cedula, typeId);

  if (loading || !sessionLoaded) {
    return <Loading />;
  }

  if (error) {
    return (
      <EmptyState
        title="No fue posible cargar el trámite"
        description={error}
      />
    );
  }

  const procedure = procedures.find((item) => item.id === parsedId);

  if (!procedure) {
    return (
      <EmptyState
        title="Trámite no encontrado"
        description="El trámite solicitado no existe o ya no se encuentra disponible."
      />
    );
  }

  const Icon = resolveIcon(procedure.icon);
  const color = procedure.color || DEFAULT_COLOR;
  const iconBg = `${color}1a`;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/procedures"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#082b63] transition hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a trámites
      </Link>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl"
            style={{ backgroundColor: iconBg, color }}
          >
            <Icon className="h-10 w-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {procedure.title}
            </h2>

            {procedure.description && (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
                {procedure.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {!cedula ? (
        <EmptyState
          title="Inicie una consulta"
          description="Para registrar un trámite primero debe iniciar una consulta con su identificación."
        />
      ) : procedure.code === "account_statement" ? (
        // El estado de cuenta no muestra historial: se genera y envía al
        // instante. El formulario se arrecuesta al menú y los mensajes
        // informativos aparecen a su costado (el componente maneja su grilla).
        <AccountStatementForm procedure={procedure} cedula={cedula} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ProcedureRequestForm
              procedure={procedure}
              cedula={cedula}
              onCreated={reload}
              initialPropertyNumber={initialFinca}
            />
          </div>

          <div className="lg:col-span-2">
            <ProcedureHistoryTable
              requests={requests}
              loading={loadingRequests}
              error={errorRequests}
              showProperty={procedure.requiresProperty}
            />
          </div>
        </div>
      )}
    </div>
  );
}
