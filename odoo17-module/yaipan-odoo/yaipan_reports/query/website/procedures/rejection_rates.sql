-- =============================================================================
-- CONSULTA: Análisis de Tasas de Rechazo de Trámites
-- DESCRIPCIÓN: Motivos de rechazo y devolución de trámites municipales
-- ENDPOINT: /api/v1/procedures/rejection-rates
-- =============================================================================

-- NOTA PARA EL EQUIPO DE BASE DE DATOS:
-- Esta consulta debe retornar los siguientes campos:
-- - reason: Motivo de rechazo/devolución (ej: "Documentos Incompletos")
-- - rejected: Cantidad de trámites rechazados definitivamente
-- - returned: Cantidad de trámites devueltos para corrección
-- - total: Total (rejected + returned)
-- - percentage: Porcentaje del total de problemas

-- MOTIVOS COMUNES ESPERADOS:
-- - "Documentos Incompletos"
-- - "Formularios Incorrectos" 
-- - "Falta de Permisos Previos"
-- - "Información Inconsistente"
-- - "Requisitos Técnicos No Cumplidos"

-- PERÍODO: Últimos 3 meses para análisis reciente
-- ESTADOS: Solo 'Rechazado' y 'Devuelto'

-- Consulta real basada en dec.CUF_sercli para tasas de rechazo
WITH rechazos_por_motivo AS (
    SELECT 
        CASE 
            WHEN COD_EST_TR IN ('REV', 'REC') OR OBSERVACIO LIKE '%DOCUMENTO%' OR OBSERVACIO LIKE '%INCOMPLETO%' THEN 'Documentos Incompletos'
            WHEN OBSERVACIO LIKE '%FORMULARIO%' OR OBSERVACIO LIKE '%FORMATO%' OR OBSERVACIO LIKE '%CORRECTO%' THEN 'Formularios Incorrectos'
            WHEN OBSERVACIO LIKE '%PERMISO%' OR OBSERVACIO LIKE '%PREVIO%' OR OBSERVACIO LIKE '%REQUISITO%' THEN 'Falta de Permisos Previos'
            WHEN OBSERVACIO LIKE '%INFORMACION%' OR OBSERVACIO LIKE '%DATO%' OR OBSERVACIO LIKE '%INCONSISTENT%' THEN 'Información Inconsistente'
            WHEN OBSERVACIO LIKE '%TECNICO%' OR OBSERVACIO LIKE '%ESPECIFICACION%' OR OBSERVACIO LIKE '%NORMA%' THEN 'Requisitos Técnicos No Cumplidos'
            WHEN COD_EST_TR IN ('DEV') THEN 'Trámite Devuelto para Corrección'
            WHEN OBSERVACIO IS NOT NULL AND LENGTH(TRIM(OBSERVACIO)) > 0 THEN 'Otros Motivos Específicos'
            ELSE 'Motivo No Especificado'
        END AS motivo,
        COD_EST_TR,
        COUNT(*) AS cantidad
    FROM dec.CUF_sercli
    WHERE FEC_REGIST IS NOT NULL
      AND FEC_REGIST >= ADD_MONTHS(TRUNC(SYSDATE), -3)  -- Últimos 3 meses
      AND FEC_REGIST <= SYSDATE
      AND (COD_EST_TR IN ('REV', 'REC', 'DEV') OR COD_EST_TR LIKE '%REV%' OR COD_EST_TR LIKE '%REC%')
    GROUP BY 
        CASE 
            WHEN COD_EST_TR IN ('REV', 'REC') OR OBSERVACIO LIKE '%DOCUMENTO%' OR OBSERVACIO LIKE '%INCOMPLETO%' THEN 'Documentos Incompletos'
            WHEN OBSERVACIO LIKE '%FORMULARIO%' OR OBSERVACIO LIKE '%FORMATO%' OR OBSERVACIO LIKE '%CORRECTO%' THEN 'Formularios Incorrectos'
            WHEN OBSERVACIO LIKE '%PERMISO%' OR OBSERVACIO LIKE '%PREVIO%' OR OBSERVACIO LIKE '%REQUISITO%' THEN 'Falta de Permisos Previos'
            WHEN OBSERVACIO LIKE '%INFORMACION%' OR OBSERVACIO LIKE '%DATO%' OR OBSERVACIO LIKE '%INCONSISTENT%' THEN 'Información Inconsistente'
            WHEN OBSERVACIO LIKE '%TECNICO%' OR OBSERVACIO LIKE '%ESPECIFICACION%' OR OBSERVACIO LIKE '%NORMA%' THEN 'Requisitos Técnicos No Cumplidos'
            WHEN COD_EST_TR IN ('DEV') THEN 'Trámite Devuelto para Corrección'
            WHEN OBSERVACIO IS NOT NULL AND LENGTH(TRIM(OBSERVACIO)) > 0 THEN 'Otros Motivos Específicos'
            ELSE 'Motivo No Especificado'
        END,
        COD_EST_TR
),
motivos_agrupados AS (
    SELECT 
        motivo AS reason,
        SUM(CASE WHEN COD_EST_TR IN ('REV', 'REC') THEN cantidad ELSE 0 END) AS rejected,
        SUM(CASE WHEN COD_EST_TR IN ('DEV') THEN cantidad ELSE 0 END) AS returned,
        SUM(cantidad) AS total
    FROM rechazos_por_motivo
    GROUP BY motivo
),
total_problemas AS (
    SELECT SUM(total) AS gran_total FROM motivos_agrupados
)
SELECT 
    mg.reason,
    mg.rejected,
    mg.returned,
    mg.total,
    ROUND((mg.total * 100.0) / GREATEST(tp.gran_total, 1), 2) AS percentage
FROM motivos_agrupados mg
CROSS JOIN total_problemas tp
WHERE mg.total > 0
ORDER BY mg.total DESC