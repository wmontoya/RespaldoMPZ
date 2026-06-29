-- CONSULTA REAL: Distribución del presupuesto por metas municipales usando PRP_METASS
-- Información donde se registran las metas presupuestarias

-- Query: Budget Goals - Metas del Presupuesto Municipal
-- Descripción: Distribución del presupuesto municipal por metas/objetivos específicos usando datos reales
-- 
-- TABLAS UTILIZADAS:
-- - PRP_METASS: Contiene las metas y montos de presupuesto (MON_PRP_S1 + MON_PRP_S2)
-- 
-- CAMPOS REQUERIDOS EN EL SELECT:
-- - goalType: Descripción de la meta (DES_META)
-- - amount: Monto total del presupuesto (suma de semestres 1 y 2)
-- - percentage: Porcentaje del presupuesto total

WITH budget_by_goal AS (
    -- Agrupar presupuesto por meta del año más reciente
    SELECT 
        pm.COD_META,
        pm.DES_META,
        pm.YEA_PLA_OP,
        -- Sumar montos propuestos del semestre 1 y 2 por meta
        SUM(pm.MON_PRP_S1 + pm.MON_PRP_S2) AS amount
    FROM PRP_METASS pm
    WHERE pm.YEA_PLA_OP = (
        SELECT MAX(YEA_PLA_OP) 
        FROM PRP_METASS 
        WHERE COMPANIA = pm.COMPANIA
    )
    AND pm.COMPANIA = 'PEREZZ'
    AND pm.DES_META IS NOT NULL  -- Solo registros con meta definida
    GROUP BY pm.COD_META, pm.DES_META, pm.YEA_PLA_OP
),
total_budget AS (
    -- Calcular el total general para porcentajes
    SELECT SUM(amount) AS total_amount
    FROM budget_by_goal
)
SELECT 
    -- Descripción de la meta como goalType
    bg.DES_META AS goalType,
    
    -- Monto del presupuesto
    bg.amount AS amount,
    
    -- Porcentaje del total
    ROUND((bg.amount * 100.0 / tb.total_amount), 2) AS percentage

FROM budget_by_goal bg
CROSS JOIN total_budget tb
ORDER BY bg.amount DESC