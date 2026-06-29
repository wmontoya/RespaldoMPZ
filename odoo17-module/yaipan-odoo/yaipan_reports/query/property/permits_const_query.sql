SELECT
    CP.NUM_FINCA AS folio_real,
    CP.NUM_CUENTA AS num_cuenta,

    SP.NUM_DOC_YE AS numero_permiso,
    SP.NUM_SOL_PE AS numero_tramite_permiso,
    SP.FEC_REGIST AS fecha_registro_permiso,
    SP.COD_EST_TR AS estado_permiso,
    SP.TIP_PERMIS AS tipo_obra,
    SP.OBS_DES_UB AS descripcion,
    SP.ARE_PROYEC AS area_autorizada,
    SP.NOM_CONTAC AS solicitante,
    SP.OBS_SOL_PC AS observaciones_permiso

FROM DEC.CUF_PROPIE CP

INNER JOIN DEC.CUF_SOLPEC SP
    ON SP.NUM_CUENTA = CP.NUM_CUENTA

WHERE CP.NUM_FINCA = :num_finca

ORDER BY SP.FEC_REGIST DESC NULLS LAST