SELECT
    PE.CEDULA AS cedula_persona,

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

    PE.TIP_PERSON AS tipo_cedula,
    PE.CORREO_ELE AS correo_electronico,
    PE.TELEFONO1 AS telefono,

    CONVERT(PE.DIRECCION1, 'AL32UTF8', 'WE8MSWIN1252') AS direccion_principal,

    TO_CHAR(PE.FEC_ULT_MO, 'YYYY-MM-DD') AS ultima_actualizacion

FROM
    DEC.COM_PERSON PE

WHERE
    PE.CEDULA = :cedula