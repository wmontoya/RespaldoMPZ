-- CONSULTA REAL: Información completa de propiedades municipales por cédula o número de finca
-- Información donde se relaciona la finca registrada con su propietario, uso de suelo, visados,
-- construcciones y permisos de construcción.

/*
 * Query: People Property Information - Información completa de propiedad por contribuyente o finca
 * Descripción: Consulta integral de información catastral y municipal asociada a una persona o finca.
 * Permite obtener datos generales de la propiedad, información del propietario, uso de suelo,
 * visados, construcciones registradas y permisos de construcción relacionados.
 *
 * TABLAS / VISTAS UTILIZADAS:
 * - CUF_PROPIE: Contiene la información principal de la finca o propiedad.
 * - COM_PERSON: Contiene la información del propietario o contribuyente asociado a la finca.
 * - CUF_INSOUS: Vista/tabla con información de solicitudes de uso de suelo.
 * - CUF_DETSOV: Contiene información relacionada con visados.
 * - CUF_CONSTR: Contiene las construcciones registradas asociadas a la propiedad.
 * - CUF_SOLPEC: Contiene las solicitudes o permisos de construcción asociados a la propiedad.
 *
 * RELACIONES PRINCIPALES:
 * - CUF_PROPIE.NUM_PERSON = COM_PERSON.NUM_PERSON
 * - CUF_INSOUS.NUM_FINCA = CUF_PROPIE.NUM_FINCA
 * - CUF_DETSOV.NUM_CUENTA = CUF_PROPIE.NUM_CUENTA
 * - CUF_CONSTR.NUM_CUENTA = CUF_PROPIE.NUM_CUENTA
 * - CUF_SOLPEC.NUM_CUENTA = CUF_PROPIE.NUM_CUENTA
 *
 * FILTROS DE BÚSQUEDA:
 * - :cedula: Número de cédula del propietario registrado.
 * - :num_finca: Número de finca o folio real.
 *
 * CAMPOS REQUERIDOS EN EL SELECT:
 * - folio_real: Número de finca o folio real.
 * - plano: Número de plano catastrado.
 * - fin_senas: Señales o descripción de ubicación de la finca.
 * - distrito: Distrito donde se ubica la propiedad.
 * - area: Área registrada de la propiedad.
 * - area_construida: Área construida registrada.
 * - uso_ocupacion: Tipo de uso u ocupación actual.
 * - valor_finca: Valor registrado de la finca.
 * - porcentaje_posesion: Porcentaje de posesión del propietario.
 * - ultima_declaracion: Fecha de última declaración.
 * - ultima_modificacion: Fecha de última modificación de la propiedad.
 * - ubicacion_manzana: Código de ubicación o manzana.
 * - nombre_completo: Nombre completo o razón social del propietario.
 * - cedula: Cédula del propietario.
 * - direccion1: Dirección registrada del propietario.
 * - num_tramite: Número de trámite de uso de suelo.
 * - nombre_solicitante: Nombre del solicitante del uso de suelo.
 * - cedula_solicitante: Cédula del solicitante.
 * - correo_solicitante: Correo electrónico del solicitante.
 * - telefono_solicitante: Teléfono del solicitante.
 * - fec_solicitud: Fecha de solicitud del uso de suelo.
 * - direccion_propiedad: Dirección de la propiedad.
 * - tipo_uso_suelo: Tipo de uso de suelo solicitado.
 * - estado_uso_suelo: Estado del trámite de uso de suelo.
 * - finalidad_uso_suelo: Finalidad del uso de suelo.
 * - num_tramite_visado: Número de trámite de visado.
 * - numero_presentacion: Número de presentación del visado.
 * - area_plano_visar: Área del plano a visar.
 * - detalle_construccion: Tipo o detalle de construcción.
 * - area_construccion: Área de construcción registrada.
 * - cantidad_plantas: Cantidad de plantas de la construcción.
 * - fecha_registro_construccion: Fecha de registro de la construcción.
 * - edad_construccion: Edad de la construcción.
 * - tipologia: Código de tipología constructiva.
 * - vida_util: Vida útil de la construcción.
 * - año_contruccion: Año de inicio o construcción.
 * - estado_construccion: Estado de la construcción.
 * - numero_permiso: Número de permiso de construcción.
 * - numero_tramite_permiso: Número de trámite del permiso.
 * - fecha_registro_permiso: Fecha de registro del permiso.
 * - estado_permiso: Estado del permiso.
 * - tipo_obra: Tipo de obra autorizada.
 * - area_autorizada: Área autorizada en el permiso.
 * - solicitante: Solicitante del permiso.
 * - observaciones_permiso: Observaciones del permiso de construcción.
 */
SELECT
    -- Finca
    CP.NUM_FINCA AS Folio_real,
    CP.PLANO_CAT AS Plano,
    CONVERT(CP.SENAS_LOTE, 'AL32UTF8', 'WE8MSWIN1252') AS fin_senas,
    CP.ABR_DISTRI AS Distrito,
    CP.AREA_REGIS AS Area,
    CP.AREA_CONST AS Area_Construida,
    CP.TIP_USO_AC AS Uso_ocupacion,
    CP.MON_FINCA AS Valor_finca,
    CP.POR_POSESI AS Porcentaje_posesion,
    CP.FEC_UL_DCL AS Ultima_declaracion,
    CP.FEC_UL_ACT AS Ultima_modificacion,
    CP.COD_UBI_MA AS Ubicacion_manzana,

    -- Persona
    CASE
        WHEN PE.NOM_PERSON IS NOT NULL
         AND PE.SEG_NOMBRE IS NULL
         AND PE.APELLIDOS IS NULL
         AND PE.SEG_APELLI IS NULL
        THEN UPPER(TRIM(PE.NOM_PERSON))
        ELSE UPPER(
            TRIM(
                NVL(PE.NOM_PERSON, '') ||
                CASE WHEN PE.SEG_NOMBRE IS NOT NULL THEN ' ' || PE.SEG_NOMBRE ELSE '' END ||
                CASE WHEN PE.APELLIDOS IS NOT NULL THEN ' ' || PE.APELLIDOS ELSE '' END ||
                CASE WHEN PE.SEG_APELLI IS NOT NULL THEN ' ' || PE.SEG_APELLI ELSE '' END
            )
        )
    END AS nombre_completo,

    PE.CEDULA,
    CONVERT(PE.DIRECCION1, 'AL32UTF8', 'WE8MSWIN1252') AS direccion1,
    PE.FEC_ULT_MO AS ultima_modificacion_persona

FROM DEC.CUF_PROPIE CP

LEFT JOIN DEC.COM_PERSON PE
    ON CP.NUM_PERSON = PE.NUM_PERSON

WHERE PE.CEDULA = :cedula

ORDER BY CP.NUM_FINCA
 