-- consulta de usos de suelo

SELECT
    CP.NUM_FINCA AS folio_real,
    CP.NUM_CUENTA AS num_cuenta,

    US.NUM_SOL_US AS num_tramite,
    US.NOM_COMPLE AS nombre_solicitante,
    US.CEDULA AS cedula_solicitante,
    US.CORREO_ELE AS correo_solicitante,
    US.NUM_PLA_CA AS num_plano,
    US.TEL_SOL_US AS telefono_solicitante,
    TO_CHAR(US.FEC_SOLICI, 'YYYY-MM-DD') AS fec_solicitud,
    US.DIRECCION AS direccion_propiedad,
    US.DIR_NOTIFI AS direccion_solicitante,
    US.AREA_REGIS AS area_terreno,
    US.DET_CON_US AS observaciones,
    US.OBSERVACIO AS descripcion,
    US.NUM_DOC_TR AS numero_tramite,
    US.DES_TIP_US AS tipo_uso_suelo,
    US.DES_ESTADO AS estado_uso_suelo,
    US.DES_FINALI AS finalidad_uso_suelo

FROM DEC.CUF_PROPIE CP

INNER JOIN DEC.CUF_INSOUS US
    ON US.NUM_CUENTA = CP.NUM_CUENTA

WHERE CP.NUM_FINCA = :num_finca

ORDER BY US.FEC_SOLICI DESC NULLS LAST