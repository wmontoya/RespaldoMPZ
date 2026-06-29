-- CONSULTA REAL: Montos Semestrales del Presupuesto por Objetivos usando PRP_METASS, PRP_AREEST y PRP_OBJARE
-- Distribución de montos presupuestarios por objetivos municipales entre primer y segundo semestre

/*
 * Query: Budget Percentages - Montos Semestrales por Objetivos
 * Descripción: Distribución de montos presupuestarios por objetivos municipales entre primer y segundo semestre
 * 
 * TABLAS UTILIZADAS:
 * - PRP_METASS: Contiene los montos de presupuesto por semestre (MON_PRP_S1, MON_PRP_S2)
 * - PRP_AREEST: Contiene las descripciones de las áreas estratégicas
 * - PRP_OBJARE: Contiene las descripciones de los objetivos/departamentos
 * 
 * ESTRUCTURA ESPERADA DE RESPUESTA:
 * - objetivo: Descripción del objetivo municipal
 * - primerSemestre: Monto del primer semestre (MON_PRP_S1)
 * - segundoSemestre: Monto del segundo semestre (MON_PRP_S2)
 * - total: Suma total de ambos semestres
 * - porcentajeTotal: Porcentaje del presupuesto total municipal
 */

WITH budget_by_objective AS (
    -- Agrupar presupuesto por objetivo del año más reciente
    SELECT 
        pm.COD_AREA,
        pm.COD_OBJETI,
        -- Descripción del objetivo desde PRP_OBJARE
        COALESCE(po.DES_OBJETI, 'Objetivo no definido') AS objetivo,
        -- Monto del primer semestre
        SUM(pm.MON_PRP_S1) AS primerSemestre,
        -- Monto del segundo semestre
        SUM(pm.MON_PRP_S2) AS segundoSemestre,
        -- Total (suma de ambos semestres)
        SUM(pm.MON_PRP_S1 + pm.MON_PRP_S2) AS total
    FROM PRP_METASS pm
    LEFT JOIN PRP_OBJARE po ON pm.COD_AREA = po.COD_AREA 
                            AND pm.COD_OBJETI = po.COD_OBJETI
                            AND pm.YEA_PLA_OP = po.YEA_PLA_OP
                            AND pm.COMPANIA = po.COMPANIA
    WHERE pm.YEA_PLA_OP = (
        SELECT MAX(YEA_PLA_OP) 
        FROM PRP_METASS 
        WHERE COMPANIA = pm.COMPANIA
    )
    AND pm.COMPANIA = 'PEREZZ'
    AND pm.COD_OBJETI IS NOT NULL  -- Solo registros con objetivo definido
    GROUP BY pm.COD_AREA, pm.COD_OBJETI, po.DES_OBJETI
),
total_budget AS (
    -- Calcular el presupuesto total para porcentajes
    SELECT SUM(total) AS total_presupuesto
    FROM budget_by_objective
)
SELECT 
    -- Descripción del objetivo
    bo.objetivo,
    
    -- Monto del primer semestre
    bo.primerSemestre,
    
    -- Monto del segundo semestre
    bo.segundoSemestre,
    
    -- Total anual
    bo.total,
    
    -- Porcentaje del presupuesto total
    ROUND((bo.total * 100.0 / tb.total_presupuesto), 1) AS porcentajeTotal

FROM budget_by_objective bo
CROSS JOIN total_budget tb
WHERE bo.total > 0  -- Solo objetivos con presupuesto asignado
ORDER BY bo.total DESC