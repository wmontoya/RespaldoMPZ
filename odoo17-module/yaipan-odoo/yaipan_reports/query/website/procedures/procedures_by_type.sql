-- =============================================================================
-- CONSULTA: Distribución de Trámites por Tipo
-- DESCRIPCIÓN: Obtiene la cantidad de trámites del último año agrupados por tipo,
--              incluyendo su código y descripción.
-- ENDPOINT: /api/v1/procedures/procedures-by-type
-- =============================================================================

-- CAMPOS RETORNADOS:
-- - aux_contab    : Código auxiliar contable
-- - tip_docume    : Código del trámite
-- - des_tramit    : Descripción del trámite
-- - total_tramites: Cantidad de trámites de este tipo en el período

-- NOTAS:
-- - El período analizado corresponde a los últimos 12 meses a partir de la fecha actual.
-- - Los resultados se ordenan en forma descendente por cantidad de trámites.
-- - Para obtener porcentajes sobre el total de trámites, puede encapsularse
--   esta consulta como subquery y calcular (COUNT(*) / SUM(COUNT(*)) OVER()) * 100.

SELECT s.AUX_CONTAB,
       s.TIP_DOCUME,
       t.DES_TRAMIT,
       COUNT(*) AS total_tramites
FROM dec.CUF_sercli s
JOIN dec.CUF_TIPTRA t
  ON s.TIP_DOCUME = t.COD_TRAMIT
WHERE s.FEC_SOLICI >= ADD_MONTHS(TRUNC(SYSDATE), -12)
GROUP BY s.AUX_CONTAB, s.TIP_DOCUME, t.DES_TRAMIT
ORDER BY total_tramites DESC
