-- CONSULTA REAL: Presupuesto por áreas municipales usando PRP_METASS y PRP_AREEST
-- Información donde se registran las areas por meta - Areas estrategicas

/*
 * Query: Budget Areas - Presupuesto por Áreas Municipales
 * Descripción: Distribución del presupuesto municipal por departamentos y áreas administrativas usando datos reales
 * 
 * TABLAS UTILIZADAS:
 * - PRP_METASS: Contiene los montos de presupuesto por meta (MON_PRP_S1 + MON_PRP_S2)
 * - PRP_AREEST: Contiene las descripciones de las áreas estratégicas
 * 
 * CAMPOS REQUERIDOS EN EL SELECT:
 * - area: Descripción del área (DES_AREA)
 * - budget: Monto total del presupuesto (suma de semestres 1 y 2)
 * - percentage: Porcentaje del presupuesto total
 * - department: Departamento conceptual basado en el área
 */

WITH budget_by_area AS (
    -- Sumar presupuesto por área del año más reciente
    SELECT 
        pm.COD_AREA,
        pm.COD_OBJETI,
        pm.YEA_PLA_OP,
        -- Sumar montos propuestos del semestre 1 y 2 por área
        SUM(pm.MON_PRP_S1 + pm.MON_PRP_S2) AS budget_amount
    FROM PRP_METASS pm
    WHERE pm.YEA_PLA_OP = (
        SELECT MAX(YEA_PLA_OP) 
        FROM PRP_METASS 
        WHERE COMPANIA = pm.COMPANIA
    )
    AND pm.COMPANIA = 'PEREZZ'
    AND pm.COD_AREA IS NOT NULL  -- Solo registros con área definida
    GROUP BY pm.COD_AREA, pm.COD_OBJETI, pm.YEA_PLA_OP
),
total_budget AS (
    -- Calcular el total general para porcentajes
    SELECT SUM(budget_amount) AS total_amount
    FROM budget_by_area
)
SELECT 
    -- Descripción del área desde PRP_AREEST
    COALESCE(pa.DES_AREA, 'Área no definida') AS area,
    
    -- Monto del presupuesto
    ba.budget_amount AS budget,
    
    -- Porcentaje del total
    ROUND((ba.budget_amount * 100.0 / tb.total_amount), 2) AS percentage,
    
    -- Nombre del departamento desde PRP_OBJARE
    COALESCE(po.DES_OBJETI, 'Departamento no definido') AS department

FROM budget_by_area ba
CROSS JOIN total_budget tb
LEFT JOIN PRP_AREEST pa ON ba.COD_AREA = pa.COD_AREA 
                        AND ba.YEA_PLA_OP = pa.YEA_PLA_OP
                        AND pa.COMPANIA = 'PEREZZ'
LEFT JOIN PRP_OBJARE po ON ba.COD_AREA = po.COD_AREA 
                        AND ba.COD_OBJETI = po.COD_OBJETI
                        AND ba.YEA_PLA_OP = po.YEA_PLA_OP
                        AND po.COMPANIA = 'PEREZZ'
ORDER BY ba.budget_amount DESC