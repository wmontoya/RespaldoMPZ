-- CONSULTA REAL: Evolución histórica del presupuesto municipal usando PRP_METASS
-- Información de presupuestos por año con análisis de crecimiento

/*
 * Query: Budget History - Evolución del Presupuesto Municipal
 * Descripción: Monto total del presupuesto municipal por años usando datos reales con análisis de crecimiento
 * 
 * TABLAS UTILIZADAS:
 * - PRP_METASS: Contiene los montos de presupuesto por año (MON_PRP_S1 + MON_PRP_S2)
 * 
 * CAMPOS REQUERIDOS EN EL SELECT:
 * - year: Año fiscal (YEA_PLA_OP)
 * - amount: Monto total del presupuesto (suma de todos los semestres 1 y 2)
 * - variation: Variación respecto al año anterior
 * - growthRate: Tasa de crecimiento porcentual
 */

WITH budget_by_year AS (
    -- Sumar presupuesto total por año
    SELECT 
        pm.YEA_PLA_OP AS year_num,
        -- Sumar todos los montos propuestos del año (semestre 1 + semestre 2)
        SUM(pm.MON_PRP_S1 + pm.MON_PRP_S2) AS total_amount
    FROM PRP_METASS pm
    WHERE pm.COMPANIA = 'PEREZZ'
    AND pm.YEA_PLA_OP >= (
        SELECT MAX(YEA_PLA_OP) - 5
        FROM PRP_METASS 
        WHERE COMPANIA = 'PEREZZ'
    ) -- Últimos 5-6 años
    GROUP BY pm.YEA_PLA_OP
),
budget_with_calculations AS (
    -- Calcular variaciones y tasas de crecimiento
    SELECT 
        bby.year_num,
        bby.total_amount,
        -- Variación respecto al año anterior
        bby.total_amount - LAG(bby.total_amount) OVER (ORDER BY bby.year_num) AS year_variation,
        -- Tasa de crecimiento respecto al año anterior
        CASE 
            WHEN LAG(bby.total_amount) OVER (ORDER BY bby.year_num) > 0 THEN
                ROUND(((bby.total_amount - LAG(bby.total_amount) OVER (ORDER BY bby.year_num)) * 100.0 / 
                       LAG(bby.total_amount) OVER (ORDER BY bby.year_num)), 2)
            ELSE 0
        END AS growth_rate
    FROM budget_by_year bby
)
SELECT 
    -- Año como string
    TO_CHAR(bwc.year_num) AS year,
    
    -- Monto total del presupuesto
    bwc.total_amount AS amount,
    
    -- Variación respecto al año anterior (0 para el primer año)
    COALESCE(bwc.year_variation, 0) AS variation,
    
    -- Tasa de crecimiento (0 para el primer año)
    COALESCE(bwc.growth_rate, 0) AS growthRate

FROM budget_with_calculations bwc
ORDER BY bwc.year_num