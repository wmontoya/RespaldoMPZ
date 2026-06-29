-- consulta de informacion de los visados municipales
SELECT
    CP.NUM_FINCA AS folio_real,
    CP.NUM_CUENTA AS num_cuenta,

    DV.NUM_SOL_VI AS num_tramite_visado,
    DV.NUM_PLA_PR AS num_plano_visado,
    DV.NUM_PRESEN AS numero_presentacion,
    DV.ARE_PLA_PR AS area_plano_visar

FROM DEC.CUF_PROPIE CP

INNER JOIN DEC.CUF_DETSOV DV
    ON DV.NUM_CUENTA = CP.NUM_CUENTA

WHERE CP.NUM_FINCA = :num_finca

-- ORDER BY DV.NUM_SOL_VI DESC NULLS LAST