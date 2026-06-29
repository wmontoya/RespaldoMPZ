import {
  formatArea,
  formatPercent,
  formatCurrency,
  formatDateOnly,
 } from "@/lib/utils";
import { 
  DISTRICT, 
  LOCATION,
  USE_PROPERTY,
  OCUPATION,
  SERVICE,
  TARIFF_TYPE,
  TARIFF_CLASIFICATION,
 } from "@/lib/constants"


export type Maybe<T> = T | null | undefined


export interface PropiedadApi {
  folio_real: Maybe<string>
  plano: Maybe<string>
  fin_senas: Maybe<string>
  distrito: Maybe<string>
  area: Maybe<number | string>
  area_construida: Maybe<number | string>
  uso_ocupacion: Maybe<string>
  valor_finca: Maybe<number | string>
  porcentaje_posesion: Maybe<number | string>
  ultima_declaracion: Maybe<string>
  ultima_modificacion: Maybe<string>
  ubicacion_manzana: Maybe<string>

  nombre_completo: Maybe<string>
  cedula: Maybe<string>
  direccion1: Maybe<string>

  numero_tramite: Maybe<string>
  tipo_uso_suelo: Maybe<string>
  estado_uso_suelo: Maybe<string>
  finalidad_uso_suelo: Maybe<string>
  descripcion: Maybe<string>
  observaciones: Maybe<string>

  num_tramite_visado: Maybe<string>
  num_plano_visado: Maybe<string>
  numero_presentacion: Maybe<string>
  area_plano_visar: Maybe<string | number>

  detalle_construccion: Maybe<string>
  area_construccion: Maybe<string | number>
  cantidad_plantas: Maybe<string | number>
  fecha_registro_construccion: Maybe<string>
  edad_construccion: Maybe<string | number>
  tipologia: Maybe<string>
  vida_util: Maybe<string | number>
  año_contruccion: Maybe<string | number>
  estado_construccion: Maybe<string>

  numero_permiso: Maybe<string>
  numero_tramite_permiso: Maybe<string>
  fecha_registro_permiso: Maybe<string>
  estado_permiso: Maybe<string>
  tipo_obra: Maybe<string>
  area_autorizada: Maybe<string | number>
  solicitante: Maybe<string>
  observaciones_permiso: Maybe<string>
}

export interface PropertiesResponse {
  success: boolean
  contribuyente?: PropiedadApi[]
  error?: string
}


//interfas para unidades habitacionales
export interface HousingUnitApi {
  folio_real: Maybe<string>
  num_cuenta: Maybe<number>
  cantidad_ocupacion: Maybe<number>
  codigo_ocupacion: Maybe<string>
  fecha_registro_ocupacion: Maybe<string>
  codigo_servicio: Maybe<string>
  codigo_tarifa: Maybe<string>
  monto_tarifa_base: Maybe<number>
  tipo_tarifa: Maybe<string>
  fecha_vigencia_tarifa: Maybe<string>
}

export interface HousingUnitsResponse {
  success: boolean
  ocupaciones?: HousingUnitApi[]
  error?: string
}

export interface LandUseApi {
  numero_tramite: Maybe<string>
  tipo_uso_suelo: Maybe<string>
  estado_uso_suelo: Maybe<string>
  finalidad_uso_suelo: Maybe<string>
  descripcion: Maybe<string>
  observaciones: Maybe<string>
}

export interface LandUseResponse {
  success: boolean
  usos_suelo?: LandUseApi[]
  error?: string
}

export interface VisadoApi {
  num_tramite_visado: Maybe<string>
  num_plano_visado: Maybe<string>
  numero_presentacion: Maybe<string>
  area_plano_visar: Maybe<string | number>
}

export interface VisadosResponse {
  success: boolean
  visados?: VisadoApi[]
  error?: string
}

export interface ConstruccionApi {
  detalle_construccion: Maybe<string>
  area_construccion: Maybe<string | number>
  cantidad_plantas: Maybe<string | number>
  fecha_registro_construccion: Maybe<string>
  edad_construccion: Maybe<string | number>
  tipologia: Maybe<string>
  vida_util: Maybe<string | number>
  año_contruccion: Maybe<string | number>
  estado_construccion: Maybe<string>
}

export interface ConstructionsResponse {
  success: boolean
  construcciones?: ConstruccionApi[]
  error?: string
}

export interface PermisoApi {
  numero_permiso: Maybe<string>
  numero_tramite_permiso: Maybe<string>
  fecha_registro_permiso: Maybe<string>
  estado_permiso: Maybe<string>
  tipo_obra: Maybe<string>
  area_autorizada: Maybe<string | number>
  solicitante: Maybe<string>
  observaciones_permiso: Maybe<string>
}

export interface PermitsResponse {
  success: boolean
  permisos?: PermisoApi[]
  error?: string
}
export interface Ocupacion {
  folioReal: Maybe<string>
  numCuenta: Maybe<number>
  cantidadOcupacion: Maybe<number>
  codigoOcupacion: Maybe<string>
  fechaRegistroOcupacion: Maybe<string>
  codigoServicio: Maybe<string>
  codigoTarifa: Maybe<string>
  montoTarifaBase: Maybe<string | number>
  tipoTarifa: Maybe<string>
  fechaVigenciaTarifa: Maybe<string>
}
export interface DatosGenerales {
  folioReal: Maybe<string>
  plano: Maybe<string>
  distrito: Maybe<string>
  area: Maybe<string | number>
  areaConstruida: Maybe<string | number>
  usoOcupacion: Maybe<string>
  valorFinca: Maybe<string | number>
  porcentajePosesion: Maybe<string | number>
  ubicacionManzana: Maybe<string>
  ultimaDeclaracion: Maybe<string>
  ultimaModificacion: Maybe<string>
  direccionFinca: Maybe<string>
}

export interface UsoSuelo {
  numeroTramite: Maybe<string>
  tipoUsoSuelo: Maybe<string>
  estadoUsoSuelo: Maybe<string>
  finalidad: Maybe<string>
  descripcion: Maybe<string>
  observaciones: Maybe<string>
}

export interface Visado {
  numeroTramiteVisado: Maybe<string>
  numeroPlanoVisado: Maybe<string>
  numeroPresentacion: Maybe<string>
  areaPlanoVisar: Maybe<string | number>
}

export interface Construccion {
  detalleConstruccion: Maybe<string>
  areaConstruccion: Maybe<string | number>
  cantidadPlantas: Maybe<string | number>
  fechaRegistroConstruccion: Maybe<string>
  edadConstruccion: Maybe<string | number>
  tipologia: Maybe<string>
  vidaUtil: Maybe<string | number>
  anioConstruccion: Maybe<string | number>
  estadoConstruccion: Maybe<string>

}

export interface Permiso {
  numeroPermiso: Maybe<string>
  numeroTramitePermiso: Maybe<string>
  fechaRegistroPermiso: Maybe<string>
  estadoPermiso: Maybe<string>
  tipoObra: Maybe<string>
  areaAutorizada: Maybe<string | number>
  solicitante: Maybe<string>
  observacionesPermiso: Maybe<string>
}

export interface Propiedad {
  id: string
  folioReal: Maybe<string>
  plano: Maybe<string>
  distrito: Maybe<string>
  area: Maybe<string | number>
  direccionFinca: Maybe<string>
  datosGenerales: DatosGenerales
  usosSuelo: UsoSuelo[]
  visados: Visado[]
  construcciones: Construccion[]
  permisos: Permiso[]
  ocupaciones: Ocupacion[]
}

export interface Contribuyente {
  nombre: Maybe<string>
  cedula: Maybe<string>
  direccion: Maybe<string>
  telefono: Maybe<string>
  correo: Maybe<string>
  estado: Maybe<string>
  fechaConsulta: Maybe<string>
  propiedades: Propiedad[]
}


/**
 * Retorna el valor recibido como texto.
 * Si el valor es null, undefined o una cadena vacía,
 * devuelve el texto por defecto "Sin información registrada".
 *
 * Se utiliza para evitar mostrar valores nulos o vacíos
 * en la interfaz de usuario.
 */
export const SIN_INFORMACION = "Sin información registrada"

export function val(value: Maybe<string | number>): string {
  if (value === null || value === undefined) return SIN_INFORMACION
  const str = String(value).trim()
  return str === "" ? SIN_INFORMACION : str
}








/**
 * Convierte la respuesta del endpoint people_information
 * al modelo de datos utilizado por los componentes del frontend.
 *
 * Funciones principales:
 * - Toma los registros devueltos por el API (PropiedadApi[]).
 * - Extrae la información general del contribuyente.
 * - Agrupa las propiedades asociadas al contribuyente.
 * - Transforma los nombres de campos del API (snake_case)
 *   al formato utilizado por la aplicación (camelCase).
 * - Construye las estructuras requeridas por las pestañas:
 *   Datos Generales, Uso de Suelo, 
 *   Construcciones y Permisos.
 * - Evita crear registros vacíos cuando toda la información
 *   de una sección viene nula.
 *
 * Retorna un objeto Contribuyente listo para ser consumido
 * por los componentes React del frontend.
 */

export function adaptarProperty(registros: PropiedadApi[]): Contribuyente | null {
  if (!registros.length) return null

  const primero = registros[0]

  const propiedades: Propiedad[] = registros.map((item, index) => ({
    id: `${item.folio_real ?? "propiedad"}-${index}`,

    folioReal: item.folio_real,
    plano: item.plano,
    distrito: DISTRICT[item.distrito ?? ""] ?? item.distrito,
    area: formatArea(item.area),
    direccionFinca: item.fin_senas,

    datosGenerales: {
      folioReal: item.folio_real,
      plano: item.plano,
      distrito: DISTRICT[item.distrito ?? ""] ?? item.distrito,
      area: formatArea(item.area),
      areaConstruida: formatArea(item.area_construida),
      usoOcupacion: USE_PROPERTY[item.uso_ocupacion ?? ""] ?? item.uso_ocupacion,
      valorFinca: formatCurrency(item.valor_finca),
      porcentajePosesion: formatPercent(item.porcentaje_posesion),
      ubicacionManzana: LOCATION[item.ubicacion_manzana ?? ""] ?? item.ubicacion_manzana,
      ultimaDeclaracion: formatDateOnly(item.ultima_declaracion),
      ultimaModificacion: formatDateOnly(item.ultima_modificacion),
      direccionFinca: item.fin_senas,
    },

    usosSuelo: [],
    visados: [],
    construcciones: [],
    permisos: [],
    ocupaciones: [],
    
  }))

  return {
    nombre: primero.nombre_completo,
    cedula: primero.cedula,
    direccion: primero.direccion1,
    telefono: null,
    correo: null,
    estado: null,
    fechaConsulta: new Date().toLocaleString("es-CR"),
    propiedades,
  }
}

export function adaptarHousingUnits(registros: HousingUnitApi[]): Ocupacion[] {
  return registros.map((item) => ({
    folioReal: item.folio_real,
    numCuenta: item.num_cuenta,
    cantidadOcupacion: item.cantidad_ocupacion,
    fechaRegistroOcupacion: formatDateOnly(item.fecha_registro_ocupacion),
    codigoOcupacion: OCUPATION[item.codigo_ocupacion ?? ""] ?? item.codigo_ocupacion,
    codigoServicio: SERVICE[item.codigo_servicio ?? ""] ?? item.codigo_servicio,
    codigoTarifa: TARIFF_CLASIFICATION[item.codigo_tarifa ?? ""] ?? item.codigo_tarifa,
    montoTarifaBase: formatCurrency(item.monto_tarifa_base),
    tipoTarifa: TARIFF_TYPE[item.tipo_tarifa ?? ""] ?? item.tipo_tarifa,
    fechaVigenciaTarifa: formatDateOnly(item.fecha_vigencia_tarifa),
  }))
}

export function adaptarLandUse(registros: LandUseApi[]): UsoSuelo[] {
  return registros.map((item) => ({
    numeroTramite: item.numero_tramite,
    tipoUsoSuelo: item.tipo_uso_suelo,
    estadoUsoSuelo: item.estado_uso_suelo,
    finalidad: item.finalidad_uso_suelo,
    descripcion: item.descripcion,
    observaciones: item.observaciones,
  }))
}

export function adaptarVisados(registros: VisadoApi[]): Visado[] {
  return registros.map((item) => ({
    numeroTramiteVisado: item.num_tramite_visado,
    numeroPlanoVisado: item.num_plano_visado,
    numeroPresentacion: item.numero_presentacion,
    areaPlanoVisar: item.area_plano_visar,
  }))
}

export function adaptarConstructions(
  registros: ConstruccionApi[]
): Construccion[] {
  return registros.map((item) => ({
    detalleConstruccion: item.detalle_construccion,
    areaConstruccion: formatArea(item.area_construccion),
    cantidadPlantas: item.cantidad_plantas,
    fechaRegistroConstruccion: formatDateOnly(item.fecha_registro_construccion),
    edadConstruccion: item.edad_construccion,
    tipologia: item.tipologia,
    vidaUtil: item.vida_util,
    anioConstruccion: item.año_contruccion,
    estadoConstruccion: item.estado_construccion,
  }))
}

export function adaptarPermits(
  registros: PermisoApi[]
): Permiso[] {
  return registros.map((item) => ({
    numeroPermiso: item.numero_permiso,
    numeroTramitePermiso: item.numero_tramite_permiso,
    fechaRegistroPermiso: formatDateOnly(item.fecha_registro_permiso),
    estadoPermiso: item.estado_permiso,
    tipoObra: item.tipo_obra,
    areaAutorizada: formatArea(item.area_autorizada),
    solicitante: item.solicitante,
    observacionesPermiso: item.observaciones_permiso,
  }))
}