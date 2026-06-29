-- =============================================================================
-- CONSULTA: Evolución Mensual de Trámites Recibidos
-- DESCRIPCIÓN: Análisis mensual de trámites recibidos con estados de aprobación/rechazo
-- ENDPOINT: /api/v1/procedures/monthly-evolution
-- =============================================================================

-- NOTA PARA EL EQUIPO DE BASE DE DATOS:
-- Esta consulta debe retornar los siguientes campos:
-- - month: Nombre del mes en español (Enero, Febrero, etc.)
-- - procedures: Total de trámites recibidos en el mes
-- - approved: Trámites aprobados en el mes
-- - rejected: Trámites rechazados/devueltos en el mes
-- - year: Año de análisis (2024)
-- - approvalRate: Porcentaje de aprobación (approved/procedures * 100)
-- - rejectionRate: Porcentaje de rechazo (rejected/procedures * 100)
-- - approvedPercentage: Mismo que approvalRate (para gráfico apilado)
-- - rejectedPercentage: Mismo que rejectionRate (para gráfico apilado)

-- PERÍODO: Últimos 12 meses
-- ESTADOS REQUERIDOS: 'Aprobado', 'Rechazado', 'Devuelto', 'En Proceso'

-- Consulta real basada en dec.CUF_sercli para evolución mensual
SELECT 
    CASE TO_NUMBER(TO_CHAR(FEC_REGIST, 'MM'))
        WHEN 1 THEN 'Enero'
        WHEN 2 THEN 'Febrero'
        WHEN 3 THEN 'Marzo'
        WHEN 4 THEN 'Abril'
        WHEN 5 THEN 'Mayo'
        WHEN 6 THEN 'Junio'
        WHEN 7 THEN 'Julio'
        WHEN 8 THEN 'Agosto'
        WHEN 9 THEN 'Septiembre'
        WHEN 10 THEN 'Octubre'
        WHEN 11 THEN 'Noviembre'
        WHEN 12 THEN 'Diciembre'
    END AS month,
    COUNT(*) AS procedures,
    -- Calcular aprobados basándose en códigos de estado
    SUM(CASE 
        WHEN COD_EST_TR IN ('APR', 'ING', 'ENT') OR COD_EST_TR LIKE '%APR%' THEN 1 
        ELSE 0 
    END) AS approved,
    -- Calcular rechazados/devueltos
    SUM(CASE 
        WHEN COD_EST_TR IN ('REV', 'REC', 'DEV') OR COD_EST_TR LIKE '%REV%' THEN 1 
        ELSE 0 
    END) AS rejected,
    TO_CHAR(FEC_REGIST, 'YYYY') AS year,
    -- Calcular porcentajes
    ROUND(
        (SUM(CASE WHEN COD_EST_TR IN ('APR', 'ING', 'ENT') OR COD_EST_TR LIKE '%APR%' THEN 1 ELSE 0 END) * 100.0) 
        / GREATEST(COUNT(*), 1), 2
    ) AS approvalRate,
    ROUND(
        (SUM(CASE WHEN COD_EST_TR IN ('REV', 'REC', 'DEV') OR COD_EST_TR LIKE '%REV%' THEN 1 ELSE 0 END) * 100.0) 
        / GREATEST(COUNT(*), 1), 2
    ) AS rejectionRate,
    -- Campos adicionales para gráfico apilado (mismo valor)
    ROUND(
        (SUM(CASE WHEN COD_EST_TR IN ('APR', 'ING', 'ENT') OR COD_EST_TR LIKE '%APR%' THEN 1 ELSE 0 END) * 100.0) 
        / GREATEST(COUNT(*), 1), 2
    ) AS approvedPercentage,
    ROUND(
        (SUM(CASE WHEN COD_EST_TR IN ('REV', 'REC', 'DEV') OR COD_EST_TR LIKE '%REV%' THEN 1 ELSE 0 END) * 100.0) 
        / GREATEST(COUNT(*), 1), 2
    ) AS rejectedPercentage
FROM dec.CUF_sercli
WHERE FEC_REGIST IS NOT NULL
  AND FEC_REGIST >= ADD_MONTHS(TRUNC(SYSDATE), -12)
  AND FEC_REGIST <= SYSDATE
GROUP BY TO_CHAR(FEC_REGIST, 'YYYY'), TO_CHAR(FEC_REGIST, 'MM')
ORDER BY TO_NUMBER(TO_CHAR(FEC_REGIST, 'MM'))