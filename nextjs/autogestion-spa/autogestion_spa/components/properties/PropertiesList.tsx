"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  FileText,
  Home,
  Landmark,
  MapPin,
  Maximize,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Pagination } from "@/components/ui/Pagination"
import { useProcedures } from "@/hooks/useProcedures"
import { val, type Propiedad } from "@/types/property"

interface PropiedadesListProps {
  propiedades: Propiedad[]
  selectedId: string | null
  onSelect: (propiedad: Propiedad) => void
  onPageChange?: () => void
}

const ITEMS_PER_PAGE = 2

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string | number | null | undefined
}) {
  const isAddress = label === "Dirección"

  if (isAddress) {
    return (
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 size-4 shrink-0 text-gray-500" />

        <div>
          <dt className="text-sm text-gray-500">{label}:</dt>
          <dd className="line-clamp-2 text-sm font-medium text-gray-900">
            {val(value)}
         </dd>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-gray-500" />
      <dt className="shrink-0 text-sm text-gray-500">{label}:</dt>
      <dd className="text-sm font-medium text-gray-900">{val(value)}</dd>
    </div>
  )
}

export function PropiedadesList({
  propiedades,
  selectedId,
  onSelect,
  onPageChange,
}: PropiedadesListProps) {
  const router = useRouter()
  const { procedures } = useProcedures()
  // Tipo de trámite "Constancia de Valor Fiscal" (si está activo en Odoo).
  const fiscalProcedure = procedures.find(
    (procedure) => procedure.code === "fiscal_value",
  )

  const [page, setPage] = useState(0)

  function requestFiscalValue(propiedad: Propiedad) {
    if (!fiscalProcedure) return
    const finca = String(propiedad.folioReal ?? "").trim()
    router.push(
      `/dashboard/procedures/${fiscalProcedure.id}?finca=${encodeURIComponent(finca)}`,
    )
  }

  const totalPages = Math.max(
    1,
    Math.ceil(propiedades.length / ITEMS_PER_PAGE),
  )

  const safePage = Math.min(page, totalPages - 1)

  const startIndex = safePage * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE

  const visibleProperties = propiedades.slice(startIndex, endIndex)

  return (
    <section className="flex flex-col space-y-3">
      <div className="grid gap-3">
        {visibleProperties.map((propiedad) => {
          const isActive = propiedad.id === selectedId

          return (
            <Card
              key={propiedad.id}
              className={`border bg-white shadow-sm transition-colors ${
                isActive
                  ? "border-blue-900 shadow-md"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-900">
                    <Home className="size-6" />
                  </div>

                  <h3 className="flex-1 pt-1.5 text-lg font-bold text-gray-900">
                    Finca {val(propiedad.folioReal)}
                  </h3>

                  <FileText className="size-5 shrink-0 text-gray-400" />
                </div>

                <dl className="space-y-1.5">
                  <Row
                    icon={MapPin}
                    label="Distrito"
                    value={propiedad.distrito}
                  />

                  <Row
                    icon={Maximize}
                    label="Área"
                    value={propiedad.area}
                  />

                  <Row
                    icon={MapPin}
                    label="Dirección"
                    value={propiedad.direccionFinca}
                  />
                </dl>

                <hr className="border-gray-200" />

                <div className={fiscalProcedure ? "grid grid-cols-2 gap-3" : ""}>
                  <Button
                    variant="outline"
                    className="h-auto w-full items-center justify-center gap-2 border-gray-300 bg-white py-2 text-xs font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => onSelect(propiedad)}
                  >
                    Ver detalles
                    <ArrowRight className="size-4" />
                  </Button>


                  {fiscalProcedure && (
                    <Button
                      className="h-auto w-full items-center justify-center gap-2 whitespace-normal bg-blue-900 px-3 py-2 text-center text-xs font-medium leading-tight text-white hover:bg-blue-800"
                      onClick={() => requestFiscalValue(propiedad)}
                    >
                      <Landmark className="size-4 shrink-0" />
                      Solicitar constancia de valor fiscal
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Pagination
        page={safePage + 1}
        totalPages={totalPages}
        onPageChange={(nextPage) => {
          setPage(nextPage - 1)
          onPageChange?.()
        }}
        className="mt-2 border-t border-gray-200 pt-3"
      />
    </section>
  )
}