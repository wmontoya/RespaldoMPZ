/*
    CONSULTA: Información consolidada de Patentes Comerciales, Patentes de Licores,
    Propietarios y Propiedades.

    OBJETIVO:
    Obtener en una sola consulta la información relacionada con una patente comercial,
    el titular registrado, la propiedad asociada y, si existe, la patente de licores
    vinculada a la misma patente.

    TABLAS UTILIZADAS:
    - DEC.CUF_PATENT  (Patentes comerciales)
    - DEC.COM_PERSON  (Información de personas físicas o jurídicas)
    - DEC.CUF_PROPIE  (Propiedades / fincas)
    - DEC.CUF_PATLIC  (Patentes de licores)

    RELACIONES:
    - CUF_PATENT.NUM_PERSON = COM_PERSON.NUM_PERSON
      Permite obtener los datos del propietario o titular de la patente.

    - CUF_PATENT.NUM_CUENTA = CUF_PROPIE.NUM_CUENTA
      Permite obtener la finca o propiedad asociada a la patente.

    - CUF_PATENT.NUM_PATENT = CUF_PATLIC.NUM_PATENT
      Permite obtener la información de la patente de licores relacionada.

    INFORMACIÓN RETORNADA:
    1. Datos de la patente comercial:
       - Número de patente
       - Nombre del establecimiento
       - Actividad comercial
       - Permiso sanitario
       - Vigencia
       - Categoría
       - Período fiscal
       - Tipo de declaración
       - Distrito
       - Estado

    2. Datos del titular:
       - Cédula
       - Nombre completo (construido a partir de nombres y apellidos)

    3. Datos de la propiedad:
       - Folio real

    4. Datos de la patente de licores:
       - Número de patente de licor
       - Nombre del negocio
       - Distrito
       - Categoría
       - Tipo de licencia
       - Fecha de última actualización
       - Fecha de aprobación
       - Estado

    FILTROS:
    - Permite buscar por número de cédula del titular.
    - Permite buscar por número de finca (folio real).

    OBSERVACIONES:
    - Se utilizan LEFT JOIN para garantizar que la patente comercial
      sea retornada aun cuando no exista información relacionada
      en propiedades o patentes de licores.
    - El nombre completo se genera dinámicamente concatenando los
      campos de nombres y apellidos disponibles.
*/
SELECT
    -- Patente
    PA.NUM_PATENT AS NUMERO_PATENTE,
    PA.DES_ESTABL AS NOMBRE_ESTABLECIMIENTO_PATENTE,
    PA.DES_ACTIVI AS ACTIVIDAD_COMERCIAL_PATENTE,
    PA.NUM_DOC_SA AS PERMISO_SALUD_PATENTE,
    PA.FEC_VIG_SA AS VIGENCIA_pATENTE,
    PA.COD_CATEGO AS CATEGORIA_PATENTE,
    PA.PER_FISCAL AS PERIODO_FISCAL_PATENTE,
    PA.TIP_DECLAR AS TIPO_DECLARACION,
    PA.ABR_DISTRI AS DISTRITO_PATENTE,
    PA.IND_CLAUSU AS ESTADO_CLAUSURA_PATENTE,
    PA.IND_SUSPEN AS ESTADO_SUSPENSION_PATENTE,
    PA.IND_ACTIVO AS ESTADO_ACTIVO_PATENTE,
    PA.IND_RETIRA AS ESTADO_RETIRO_PATENTE,
    PA.IND_EXONER AS ESTADO_EXONERACION_PATENTE,
    PA.IND_ENV_AR AS ESTADO_ENVIO_ARCHIVO_PATENTE,


    -- Persona
    PE.CEDULA,

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
    END AS NOMBRE_COMPLETO,

    -- Finca
    CP.NUM_FINCA AS FOLIO_REAL,
    CP.SENAS_LOTE AS DIRECCION,

    -- Patente de licores
    PL.NUM_PAT_LI AS NUMERO_PATENTE_LICO,
    PL.NOM_NEGOCI AS NOMBRE_NEGOCIO_LICO,
    PL.ABR_DISTRI AS DISTRITO_LICO,
    PL.COD_PAT_LI AS CATEGORIA_LICO,
    PL.TIP_PAT_LI AS TIPO_LICENCIA_LICO,
    PL.FEC_ULT_AC AS FECHA_ULTIMA_ACTUALIZACION_LICO,
    PL.FEC_APROBA AS FECHA_APROBADO_LICO,
    PL.IND_ACTIVA AS ESTADO_ACTIVO_LICO,
    PL.IND_RETIRA AS ESTADO_RETIRO_LICO,
    PL.IND_ENV_AR AS ESTADO_ENVIO_ARCHIVO_LICO


FROM DEC.CUF_PATENT PA

LEFT JOIN DEC.COM_PERSON PE
    ON PA.NUM_PERSON = PE.NUM_PERSON

LEFT JOIN DEC.CUF_PROPIE CP
    ON PA.NUM_CUENTA = CP.NUM_CUENTA

LEFT JOIN DEC.CUF_PATLIC PL
    ON PL.NUM_PATENT = PA.NUM_PATENT

WHERE PE.CEDULA = :cedula
   