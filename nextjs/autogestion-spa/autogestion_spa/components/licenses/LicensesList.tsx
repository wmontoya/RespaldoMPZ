"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Landmark,
  ShieldCheck,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Pagination } from "@/components/ui/Pagination"
import type { BusinessLicense } from "@/types/license"

interface LicensesListProps {
  licenses: BusinessLicense[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const ITEMS_PER_PAGE = 2

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-gray-500" />
      <dt className="shrink-0 text-xs text-gray-500">{label}:</dt>
      <dd className="text-xs font-medium text-gray-900">{value}</dd>
    </div>
  )
}

export function LicensesList({
  licenses,
  selectedId,
  onSelect,
}: LicensesListProps) {
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(licenses.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages - 1)

  const startIndex = safePage * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const visibleLicenses = licenses.slice(startIndex, endIndex)

  return (
    <section className="flex flex-col space-y-3">
      <div className="grid gap-3">
        {visibleLicenses.map((license) => {
          const isActive = license.id === selectedId

          return (
            <Card
              key={license.id}
              className={`border bg-white shadow-sm transition-colors ${
                isActive
                  ? "border-blue-900 shadow-md"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Patente #{license.numeroPatente}
                    </h3>

                    <p className="mt-1 text-sm text-gray-800">
                      {license.nombreEstablecimiento}
                    </p>
                  </div>

                  <FileText className="size-4 text-gray-400" />
                </div>

                <dl className="space-y-1.5">
                  <Row
                    icon={BadgeCheck}
                    label="Categoría"
                    value={license.categoriaPatente}
                  />

                  <Row
                    icon={Landmark}
                    label="Distrito"
                    value={license.distritoPatente}
                  />

                  <Row
                    icon={ShieldCheck}
                    label="Estado"
                    value={license.estadoPatente}
                  />
                </dl>

                <Button
                  variant={isActive ? "default" : "outline"}
                  className={`mt-auto h-8 w-full text-xs ${
                    isActive
                      ? "bg-blue-900 text-white hover:bg-blue-800"
                      : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => onSelect(license.id)}
                >
                  {isActive ? "Seleccionada" : "Ver detalles"}
                  <ArrowRight className="size-3.5" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Pagination
        page={safePage + 1}
        totalPages={totalPages}
        onPageChange={(nextPage) => setPage(nextPage - 1)}
        className="mt-auto border-t border-gray-200 pt-3"
      />
    </section>
  )
}