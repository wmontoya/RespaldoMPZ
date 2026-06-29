import { Citizen } from "@/types/citizen";
import { User, IdCard, MapPin, Phone, Mail } from "lucide-react";
import { getIdentificationTypeLabel } from "@/lib/utils";

interface CitizenSummaryCardProps {
  citizen: Citizen;
}

export function CitizenSummaryCard({
  citizen,
}: CitizenSummaryCardProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-sky-100 p-3">
          <User className="h-6 w-6 text-[#082b63]" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#082b63]">
            {citizen.nombre_completo}
          </h2>

          <p className="text-sm text-gray-500">
            Información del contribuyente
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <IdCard className="h-4 w-4 text-[#082b63]" />
            <span className="text-sm font-semibold text-gray-700">
              Identificación
            </span>
          </div>

          <p className="text-gray-900">
            {citizen.cedula_persona}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <IdCard className="h-4 w-4 text-[#082b63]" />
            <span className="text-sm font-semibold text-gray-700">
              Tipo
            </span>
          </div>

          <p className="text-gray-900">
            {getIdentificationTypeLabel(citizen.tipo_cedula)}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Phone className="h-4 w-4 text-[#082b63]" />
            <span className="text-sm font-semibold text-gray-700">
              Teléfono
            </span>
          </div>

          <p className="text-gray-900">
            {citizen.telefono || "Sin información registrada"}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#082b63]" />
            <span className="text-sm font-semibold text-gray-700">
              Correo electrónico
            </span>
          </div>

          <p className="text-gray-900 break-all">
            {citizen.correo_electronico || "Sin información registrada"}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 md:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#082b63]" />
            <span className="text-sm font-semibold text-gray-700">
              Dirección Principal
            </span>
          </div>

          <p className="text-gray-900">
            {citizen.direccion_principal}
          </p>
        </div>
      </div>
    </div>
  );
}