import { DISTRICT, TYPE_DECLARATION, CATEGORY_PATENT, FISCAL_PERIOD_PATENT} from "@/lib/constants";
import { formatDateOnly, formatStatusFlags } from "@/lib/utils";

export const SIN_INFORMACION = "Sin información registrada";

export function val(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return SIN_INFORMACION;
  }

  return String(value);
}

export type BusinessLicenseApi = {
  numero_patente?: string | number | null;
  nombre_establecimiento_patente?: string | null;
  actividad_comercial_patente?: string | null;
  permiso_salud_patente?: string | null;
  vigencia_patente?: string | null;
  categoria_patente?: string | null;
  periodo_fiscal_patente?: string | number | null;
  tipo_declaracion?: string | null;
  distrito_patente?: string | null;

  estado_clausura_patente?: string | null;
  estado_suspension_patente?: string | null;
  estado_activo_patente?: string | null;
  estado_retiro_patente?: string | null;
  estado_exoneracion_patente?: string | null;
  estado_envio_archivo_patente?: string | null;

  cedula?: string | null;
  nombre_completo?: string | null;

  folio_real?: string | number | null;
  direccion?: string | null;

  numero_patente_lico?: string | number | null;
  nombre_negocio_lico?: string | null;
  distrito_lico?: string | null;
  categoria_lico?: string | null;
  tipo_licencia_lico?: string | null;
  fecha_ultima_actualizacion_lico?: string | null;
  fecha_aprobado_lico?: string | null;

  estado_activo_lico?: string | null;
  estado_retiro_lico?: string | null;
  estado_envio_archivo_lico?: string | null;
};

export type BusinessLicense = {
  id: string;

  numeroPatente: string;
  nombreEstablecimiento: string;
  actividadComercial: string;
  permisoSalud: string;
  vigencia: string;
  categoriaPatente: string;
  periodoFiscal: string;
  tipoDeclaracion: string;
  distritoPatente: string;
  estadoPatente: string;

  cedula: string;
  nombreCompleto: string;

  folioReal: string;
  direccion: string;

  numeroPatenteLico: string;
  nombreNegocioLico: string;
  distritoLico: string;
  categoriaLico: string;
  tipoLicenciaLico: string;
  fechaUltimaActualizacionLico: string;
  fechaAprobadoLico: string;
  estadoLico: string;
};

export type BusinessLicenseResponse = {
  success: boolean;
  contribuyente: BusinessLicenseApi[];
  error?: string;
};

export function adaptarLicencia(
  item: BusinessLicenseApi,
  index: number
): BusinessLicense {
  return {
    id: `${item.numero_patente ?? "patente"}-${item.numero_patente_lico ?? "sin-lico"}-${index}`,

    numeroPatente: val(item.numero_patente),
    nombreEstablecimiento: val(item.nombre_establecimiento_patente),
    actividadComercial: val(item.actividad_comercial_patente),
    permisoSalud: val(item.permiso_salud_patente),
    vigencia: val(formatDateOnly(item.vigencia_patente)),
    categoriaPatente: CATEGORY_PATENT[item.categoria_patente ?? ""] ?? item.categoria_patente,
    periodoFiscal: FISCAL_PERIOD_PATENT[item.periodo_fiscal_patente ?? ""] ?? item.periodo_fiscal_patente,
    tipoDeclaracion: TYPE_DECLARATION[item.tipo_declaracion ?? ""] ?? item.tipo_declaracion,
    distritoPatente: val(
      DISTRICT[item.distrito_patente ?? ""] ?? item.distrito_patente
    ),

    estadoPatente: formatStatusFlags([
      {
        value: item.estado_clausura_patente,
        label: "Clausurada",
      },
      {
        value: item.estado_suspension_patente,
        label: "Suspendida",
      },
      {
        value: item.estado_activo_patente,
        label: "Activa",
      },
      {
        value: item.estado_retiro_patente,
        label: "Retirada",
      },
      {
        value: item.estado_exoneracion_patente,
        label: "Exonerada",
      },
      {
        value: item.estado_envio_archivo_patente,
        label: "Enviada a archivo",
      },
    ]),

    cedula: val(item.cedula),
    nombreCompleto: val(item.nombre_completo),

    folioReal: val(item.folio_real),
    direccion: val(item.direccion),

    numeroPatenteLico: val(item.numero_patente_lico),
    nombreNegocioLico: val(item.nombre_negocio_lico),
    distritoLico: val(DISTRICT[item.distrito_lico ?? ""] ?? item.distrito_lico),
    categoriaLico: CATEGORY_PATENT[item.categoria_lico ?? ""] ?? item.categoria_lico,
    tipoLicenciaLico: CATEGORY_PATENT[item.tipo_licencia_lico ?? ""] ?? item.tipo_licencia_lico,
    fechaUltimaActualizacionLico: val(
      formatDateOnly(item.fecha_ultima_actualizacion_lico)
    ),
    fechaAprobadoLico: val(formatDateOnly(item.fecha_aprobado_lico)),

    estadoLico: formatStatusFlags([
      {
        value: item.estado_activo_lico,
        label: "Activa",
      },
      {
        value: item.estado_retiro_lico,
        label: "Retirada",
      },
      {
        value: item.estado_envio_archivo_lico,
        label: "Enviada a archivo",
      },
    ]),
  };
}

export function adaptarLicencias(
  registros: BusinessLicenseApi[]
): BusinessLicense[] {
  return registros.map((item, index) => adaptarLicencia(item, index));
}