"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { FieldGrid } from "@/components/properties/FieldGrid"
import { Pagination } from "@/components/ui/Pagination"
import { val, type Propiedad } from "@/types/property"


//funcion de paginacion
function getPagination<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const safePage = Math.min(page, totalPages - 1)

  const visibleItems = items.slice(
    safePage * perPage,
    safePage * perPage + perPage,
  )

  return { totalPages, safePage, visibleItems }
}

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  return (
    <Pagination
      page={page + 1}
      totalPages={totalPages}
      onPageChange={(nextPage) => onPageChange(nextPage - 1)}
      className="border-t border-gray-200 bg-white px-4 py-3"
    />
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm italic text-gray-600">
      {message}
    </div>
  )
}

export function DetallePropiedad({
  propiedad,
}: {
  propiedad: Propiedad | null
}) {
      //paginación para ocupaciones
  const [ocupacionesPage, setOcupacionesPage] = useState(0)
 
  const [visadosPage, setVisadosPage] = useState(0)
  const [usosSueloPage, setUsosSueloPage] = useState(0)
  const [construccionesPage, setConstruccionesPage] = useState(0)
  const [permisosPage, setPermisosPage] = useState(0)

    if (!propiedad) {
    return (
      <Card className="h-full border border-gray-200 bg-white shadow-sm">
        <CardHeader className="px-5 py-4">
          <CardTitle className="text-base font-semibold text-gray-900">
            Detalle de la propiedad
          </CardTitle>
        </CardHeader>

        <CardContent className="flex min-h-[420px] items-center justify-center">
          <div className="text-center">
            <p className="text-base font-medium text-gray-900">
              Ninguna propiedad seleccionada
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Seleccione una propiedad del listado para visualizar su información.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  const dg = propiedad.datosGenerales

  const ocupacionesPagination = getPagination(
    propiedad.ocupaciones,
    ocupacionesPage,
    4,
  )

  const visadosPagination = getPagination(propiedad.visados, visadosPage, 2)

  const usosSueloPagination = getPagination(propiedad.usosSuelo, usosSueloPage, 1)

  const construccionesPagination = getPagination(
    propiedad.construcciones,
    construccionesPage,
    2,
  )

  const permisosPagination = getPagination(propiedad.permisos, permisosPage, 2)


  return (
    <Card className="h-full border border-gray-200 bg-white shadow-sm">
      <CardHeader className="px-5 py-4">
        <CardTitle className="text-base font-semibold text-gray-900">
          Detalle de la propiedad: Finca {val(propiedad.folioReal)}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <Tabs key={propiedad.id} defaultValue="generales" className="w-full">
          <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 bg-gray-100 p-1">
            <TabsTrigger value="generales">Datos Generales</TabsTrigger>
            <TabsTrigger value="uso">Uso de Suelo</TabsTrigger>
            <TabsTrigger value="visados">Visados</TabsTrigger>
            <TabsTrigger value="construcciones">Construcciones</TabsTrigger>
            <TabsTrigger value="permisos">Permisos</TabsTrigger>
            <TabsTrigger value="ocupaciones">Servicios e Impuestos</TabsTrigger>
          </TabsList>

          <TabsContent value="generales" className="mt-4">
            <FieldGrid
              fields={[
                { label: "Folio Real", value: dg.folioReal },
                { label: "Plano", value: dg.plano },
                { label: "Distrito", value: dg.distrito },
                { label: "Área", value: dg.area },
                { label: "Área Construida", value: dg.areaConstruida },
                { label: "Uso/Ocupación", value: dg.usoOcupacion },
                { label: "Valor de la Finca", value: dg.valorFinca },
                { label: "Porcentaje de Posesión", value: dg.porcentajePosesion },
                { label: "Ubicación Manzana", value: dg.ubicacionManzana },
                { label: "Última Declaración", value: dg.ultimaDeclaracion },
                { label: "Última Modificación", value: dg.ultimaModificacion },
                { label: "Dirección de la Finca", value: dg.direccionFinca },
              ]}
            />
          </TabsContent>

          <TabsContent value="uso" className="mt-5 space-y-4">
            {propiedad.usosSuelo.length === 0 ? (
              <EmptyState message="Sin información registrada para uso de suelo." />
            ) : (
              usosSueloPagination.visibleItems.map((u, i) => (
                <FieldGrid
                  key={`${u.numeroTramite ?? "uso"}-${i}`}
                  fields={[
                    { label: "Número Trámite", value: u.numeroTramite },
                    { label: "Tipo Uso de Suelo", value: u.tipoUsoSuelo },
                    { label: "Estado Uso de Suelo", value: u.estadoUsoSuelo },
                    { label: "Finalidad", value: u.finalidad },
                    { label: "Descripción", value: u.descripcion },
                    { label: "Observaciones", value: u.observaciones },
                  ]}
                />
              ))
            )}
            <PaginationControls
              page={usosSueloPagination.safePage}
              totalPages={usosSueloPagination.totalPages}
              onPageChange={setUsosSueloPage}
            />
          </TabsContent>

          <TabsContent value="visados" className="mt-5 space-y-4">
              {propiedad.visados.length === 0 ? (
                <EmptyState message="Sin información registrada para visados." />
              ) : (
                visadosPagination.visibleItems.map((v, i) => (
                  <div
                    key={`${v.numeroTramiteVisado ?? "visado"}-${i}`}
                    className={i > 0 ? "border-t border-gray-200 pt-4" : ""}
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div>
                        <dt className="text-sm text-gray-500">Número Trámite Visado</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {val(v.numeroTramiteVisado)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm text-gray-500">Número Plano Visado</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {val(v.numeroPlanoVisado)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm text-gray-500">Número Presentación</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {val(v.numeroPresentacion)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm text-gray-500">Área Plano Visar</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {val(v.areaPlanoVisar)}
                        </dd>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <PaginationControls
                page={visadosPagination.safePage}
                totalPages={visadosPagination.totalPages}
                onPageChange={setVisadosPage}
              />
            </TabsContent>

          
          <TabsContent value="construcciones" className="mt-5 space-y-4">
            {propiedad.construcciones.length === 0 ? (
              <EmptyState message="Sin información registrada para construcciones." />
            ) : (
              construccionesPagination.visibleItems.map((c, i) => (
                <div
                  key={`${c.detalleConstruccion ?? "construccion"}-${i}`}
                  className={i > 0 ? "border-t border-gray-200 pt-4" : ""}
                >
                  <FieldGrid
                    fields={[
                      { label: "Detalle Construcción", value: c.detalleConstruccion },
                      { label: "Área Construcción", value: c.areaConstruccion },
                      { label: "Cantidad Plantas", value: c.cantidadPlantas },
                      { label: "Fecha Registro Construcción", value: c.fechaRegistroConstruccion },
                      { label: "Edad Construcción", value: c.edadConstruccion },
                      { label: "Tipología", value: c.tipologia },
                      { label: "Vida Útil", value: c.vidaUtil },
                      { label: "Año Construcción", value: c.anioConstruccion },
                      { label: "Estado Construcción", value: c.estadoConstruccion },
                    ]}
                  />
                </div>
              ))
            )}

            <PaginationControls
              page={construccionesPagination.safePage}
              totalPages={construccionesPagination.totalPages}
              onPageChange={setConstruccionesPage}
            />
          </TabsContent>

          <TabsContent value="permisos" className="mt-5 space-y-4">
            {propiedad.permisos.length === 0 ? (
              <EmptyState message="Sin información registrada para permisos." />
            ) : (
              permisosPagination.visibleItems.map((p, i) => (
                <div
                  key={`${p.numeroPermiso ?? p.numeroTramitePermiso ?? "permiso"}-${i}`}
                  className={i > 0 ? "border-t border-gray-200 pt-4" : ""}
                >
                  <FieldGrid
                    fields={[
                      { label: "Número Permiso", value: p.numeroPermiso },
                      { label: "Número Trámite Permiso", value: p.numeroTramitePermiso },
                      { label: "Fecha Registro Permiso", value: p.fechaRegistroPermiso },
                      { label: "Estado Permiso", value: p.estadoPermiso },
                      { label: "Tipo Obra", value: p.tipoObra },
                      { label: "Área Autorizada", value: p.areaAutorizada },
                      { label: "Solicitante", value: p.solicitante },
                      { label: "Observaciones Permiso", value: p.observacionesPermiso },
                    ]}
                  />
                </div>
              ))
            )}
            <PaginationControls
              page={permisosPagination.safePage}
              totalPages={permisosPagination.totalPages}
              onPageChange={setPermisosPage}
            />
          </TabsContent>

          <TabsContent value="ocupaciones" className="mt-4">
  {propiedad.ocupaciones.length === 0 ? (
    <EmptyState message="Sin información registrada para ocupaciones." />
  ) : (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 text-left text-gray-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Ocupación</th>
            <th className="px-4 py-3 font-semibold">Servicio</th>
            <th className="px-4 py-3 font-semibold">Tarifa</th>
            <th className="px-4 py-3 font-semibold">Monto Tarifa Base</th>
            <th className="px-4 py-3 font-semibold">Tipo Tarifa</th>
            <th className="px-4 py-3 font-semibold">Fecha Vigencia</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 bg-white">
          {ocupacionesPagination.visibleItems.map((o, i) => (
            <tr
              key={`${o.codigoOcupacion ?? "ocupacion"}-${o.codigoServicio ?? "servicio"}-${o.codigoTarifa ?? "tarifa"}-${i}`}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-gray-900">{val(o.codigoOcupacion)}</td>
              <td className="px-4 py-3 text-gray-900">{val(o.codigoServicio)}</td>
              <td className="px-4 py-3 text-gray-900">{val(o.codigoTarifa)}</td>
              <td className="px-4 py-3 text-gray-900">{val(o.montoTarifaBase)}</td>
              <td className="px-4 py-3 text-gray-900">{val(o.tipoTarifa)}</td>
              <td className="px-4 py-3 text-gray-900">{val(o.fechaVigenciaTarifa)}</td>
            </tr>
          ))}
        </tbody>
      </table>

        <PaginationControls
          page={ocupacionesPagination.safePage}
          totalPages={ocupacionesPagination.totalPages}
          onPageChange={setOcupacionesPage}
        />
            </div>
          )}
</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}