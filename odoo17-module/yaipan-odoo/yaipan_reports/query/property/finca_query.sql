SELECT
    CP.COD_CANTON AS fin_canton_code,
    CP.ABR_DISTRI AS fin_district_code,
    CONVERT(CP.SENAS_LOTE, 'AL32UTF8', 'WE8MSWIN1252') AS fin_senas,
    CP.NUM_FINCA AS num_finca,
    CP.AREA_REGIS AS area,
    CASE
        WHEN PE.NOM_PERSON IS NOT NULL
         AND PE.SEG_NOMBRE IS NULL
         AND PE.APELLIDOS IS NULL
         AND PE.SEG_APELLI IS NULL
        THEN UPPER(TRIM(PE.NOM_PERSON))
        ELSE UPPER(
            TRIM(
                NVL (PE.NOM_PERSON, '') ||
                CASE WHEN PE.SEG_NOMBRE IS NOT NULL THEN ' ' || PE.SEG_NOMBRE ELSE '' END ||
                CASE WHEN PE.APELLIDOS IS NOT NULL THEN ' ' || PE.APELLIDOS ELSE '' END ||
                CASE WHEN PE.SEG_APELLI IS NOT NULL THEN ' ' || PE.SEG_APELLI ELSE '' END
            )
        )
    END AS nombre_completo,
    PE.CEDULA,
    CONVERT(PE.DIRECCION1, 'AL32UTF8', 'WE8MSWIN1252') AS direccion1,
    CONVERT(PE.DIRECCION2, 'AL32UTF8', 'WE8MSWIN1252') AS direccion2,
    PE.CORREO_ELE AS correo,
    CASE WHEN REGEXP_LIKE (PE.TELEFONO1, '^2') THEN PE.TELEFONO1 ELSE null END AS telefono,
    CASE WHEN REGEXP_LIKE (PE.TELEFONO1, '^[678]') THEN PE.TELEFONO1 ELSE null END AS movil,

    US.NUM_SOL_US           AS num_tramite,
    US.NOM_COMPLE           AS nombre_solicitante,
    US.CEDULA               AS cedula_solicitante,
    US.CORREO_ELE           AS correo_solicitante,
    US.NUM_PLA_CA           AS num_plano,
    US.TEL_SOL_US           AS telefono_solicitante,
    TO_CHAR(US.FEC_SOLICI, 'YYYY-MM-DD') AS fec_solicitud,
    US.DIRECCION            AS direccion_propiedad,
    US.DIR_NOTIFI           AS direccion_solicitante,
    US.AREA_REGIS           AS area_terreno,
    US.DET_CON_US           AS observaciones,
    US.OBSERVACIO           AS descripcion,
    US.DES_TIP_US           AS tipo_uso_suelo,
    US.DES_ESTADO           AS estado_uso_suelo,
    US.DES_FINALI           AS finalidad_uso_suelo

FROM
    DEC.CUF_PROPIE CP
    LEFT JOIN DEC.COM_PERSON PE ON CP.NUM_PERSON = PE.NUM_PERSON
    LEFT JOIN DEC.CUF_INSOUS US ON US.NUM_FINCA = CP.NUM_FINCA AND US.DES_FINALI = 'LICENCIA MUNICIPAL'
WHERE PE.CEDULA = :cedula
   OR CP.NUM_FINCA = :num_finca