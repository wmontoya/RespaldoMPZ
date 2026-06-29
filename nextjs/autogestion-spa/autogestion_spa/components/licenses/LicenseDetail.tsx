import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import type { BusinessLicense } from "@/types/license"

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}

export function LicenseDetail({ license }: { license: BusinessLicense }) {
  return (
    <Card className="h-full border-gray-200 bg-white shadow-sm">
      <CardHeader className="px-5 py-4">
        <CardTitle className="text-base font-semibold text-gray-900">
          Detalle de la patente #{license.numeroPatente}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-5 pb-5">
        <Tabs key={license.id} defaultValue="generales" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="generales">Datos Generales</TabsTrigger>
            <TabsTrigger value="licores">Licencias de Licores</TabsTrigger>
          </TabsList>

          <TabsContent value="generales" className="space-y-4">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Información general
              </h3>

              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Establecimiento" value={license.nombreEstablecimiento} />
                <Field label="Actividad comercial" value={license.actividadComercial} />
                <Field label="Permiso de salud" value={license.permisoSalud} />
                <Field label="Vigencia" value={license.vigencia} />
                <Field label="Categoría" value={license.categoriaPatente} />
                <Field label="Periodo fiscal" value={license.periodoFiscal} />
                <Field label="Tipo declaración" value={license.tipoDeclaracion} />
                <Field label="Distrito" value={license.distritoPatente} />
                <Field label="Estado" value={license.estadoPatente} />
              </div>
            </section>

            <section className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Información del contribuyente
              </h3>

              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Cédula" value={license.cedula} />
                <Field label="Nombre completo" value={license.nombreCompleto} />
                <Field label="Folio real" value={license.folioReal} />
                <Field label="Dirección" value={license.direccion} />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="licores">
            {license.numeroPatenteLico !== "Sin información registrada" ? (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Licencia de licores asociada
                </h3>

                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Field label="Número licencia" value={license.numeroPatenteLico} />
                  <Field label="Nombre negocio" value={license.nombreNegocioLico} />
                  <Field label="Distrito" value={license.distritoLico} />
                  <Field label="Categoría" value={license.categoriaLico} />
                  <Field label="Tipo licencia" value={license.tipoLicenciaLico} />
                  <Field label="Fecha aprobado" value={license.fechaAprobadoLico} />
                  <Field
                    label="Última actualización"
                    value={license.fechaUltimaActualizacionLico}
                  />
                  <Field label="Estado" value={license.estadoLico} />
                </div>
              </section>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
                <p className="text-sm font-medium text-gray-900">
                  Sin licencias de licores
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Esta patente no posee una licencia de licores asociada.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}