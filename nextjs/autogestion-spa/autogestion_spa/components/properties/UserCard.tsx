"use client"

import type { LucideIcon } from "lucide-react"
import {
  CalendarClock,
  IdCard,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react"

import { Badge } from "@/components/ui/Badge"
import { Card, CardContent } from "@/components/ui/Card"
import { SIN_INFORMACION, val, type Contribuyente } from "@/types/property"

function estadoVariant(estado: string) {
  const normalized = estado.toLowerCase().trim()

  if (normalized === "activo") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200"
  }

  if (normalized === "inactivo" || normalized === "suspendido") {
    return "bg-red-100 text-red-700 border-red-200"
  }

  return "bg-gray-100 text-gray-700 border-gray-200"
}

export function ContribuyenteCard({
  contribuyente,
}: {
  contribuyente: Contribuyente
}) {
  const estado = val(contribuyente.estado)
  const showBadge = estado !== SIN_INFORMACION

  const items: {
    icon: LucideIcon
    label: string
    value: string | number | null | undefined
  }[] = [
    { icon: IdCard, label: "Cédula", value: contribuyente.cedula },
    { icon: Phone, label: "Teléfono", value: contribuyente.telefono },
    { icon: Mail, label: "Correo", value: contribuyente.correo },
    { icon: MapPin, label: "Dirección", value: contribuyente.direccion },
  ]

  return (
    <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-900">
              <User className="size-7" aria-hidden="true" />
            </div>

            <div className="space-y-3">
              <h2 className="text-balance text-xl font-semibold text-gray-900">
                {val(contribuyente.nombre)}
              </h2>

              <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    <item.icon
                      className="size-4 shrink-0 text-gray-500"
                      aria-hidden="true"
                    />

                    <span className="text-gray-500">
                      {item.label}:
                    </span>

                    <span className="font-medium text-gray-900">
                      {val(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Estado
              </p>

              <div className="mt-1.5">
                {showBadge ? (
                  <Badge
                    variant="outline"
                    className={`font-medium ${estadoVariant(estado)}`}
                  >
                    {estado}
                  </Badge>
                ) : (
                  <span className="text-sm italic text-gray-600">
                    {estado}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                Fecha de consulta
              </p>

              <p className="mt-1.5 text-sm font-medium text-gray-900">
                {val(contribuyente.fechaConsulta)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}