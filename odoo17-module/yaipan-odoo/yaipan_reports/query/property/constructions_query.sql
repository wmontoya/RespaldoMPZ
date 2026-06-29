SELECT
    CP.NUM_FINCA AS folio_real,
    CP.NUM_CUENTA AS num_cuenta,

    CO.DES_TIP_CO AS detalle_construccion,
    CO.ARE_CONSTR AS area_construccion,
    CO.CAN_PLANTA AS cantidad_plantas,
    CO.FEC_REGIST AS fecha_registro_construccion,
    CO.EDA_CONSTR AS edad_construccion,
    CO.COD_TIPOLO AS tipologia,
    CO.VID_UTIL AS vida_util,
    CO.YEA_INICIA AS año_contruccion,
    CO.COD_ESTADO AS estado_construccion

FROM DEC.CUF_PROPIE CP

INNER JOIN DEC.CUF_CONSTR CO
    ON CO.NUM_CUENTA = CP.NUM_CUENTA

WHERE CP.NUM_FINCA = :num_finca

ORDER BY CO.FEC_REGIST DESC NULLS LAST