-- CONSULTA REAL: Mosaico de Objetivos por Área usando PRP_METASS, PRP_AREEST y PRP_OBJARE
-- Información de objetivos municipales por área con presupuesto detallado

/*
 * Query: Budget Mosaic - Objetivos por Área del Presupuesto Ordinario
 * Descripción: Distribución de objetivos municipales por área con sus respectivos montos del presupuesto ordinario
 * 
 * TABLAS UTILIZADAS:
 * - PRP_METASS: Contiene los montos de presupuesto por meta/objetivo
 * - PRP_AREEST: Contiene las descripciones de las áreas estratégicas
 * - PRP_OBJARE: Contiene las descripciones de los objetivos/departamentos
 * 
 * ESTRUCTURA DE RESPUESTA (según Next.js):
 * - area: Área estratégica (ej: "Educación", "Salud")
 * - objetivo: Descripción del objetivo específico  
 * - objetivoCompleto: Concatenación "área: objetivo"
 * - monto: Monto del presupuesto en colones
 * - porcentaje: Porcentaje del presupuesto total
 * - color: Color asignado para visualización
 */

-- PLACEHOLDER SIMPLIFICADO: Reemplazar con consulta real del equipo de BD
-- OPCIÓN 1: Usar JSON (requiere Oracle 12c+)
/*
SELECT JSON_OBJECT(
  'totalBudget' VALUE 8000000000,
  'executionRate' VALUE 76.5,
  'budgetTrend' VALUE 'up',
  'executionTrend' VALUE 'stable',
  'topCategories' VALUE JSON_ARRAYAGG(
    JSON_OBJECT(
      'category' VALUE categoria,
      'amount' VALUE monto,
      'percentage' VALUE porcentaje
    )
  ),
  'monthlyExecution' VALUE JSON_ARRAYAGG(
    JSON_OBJECT(
      'month' VALUE mes,
      'monthlyExecution' VALUE ejecucion
    )
  )
) AS dashboard_data
FROM (... consulta de datos ...)
*/

-- Consulta simplificada sin CTEs para evitar problemas de sintaxis
SELECT 
    COALESCE(pa.DES_AREA, 'Área no definida') AS area,
    COALESCE(po.DES_OBJETI, 'Objetivo no definido') AS objetivo,
    COALESCE(pa.DES_AREA, 'Área no definida') || ': ' || COALESCE(po.DES_OBJETI, 'Objetivo no definido') AS objetivoCompleto,
    SUM(pm.MON_PRP_S1 + pm.MON_PRP_S2) AS monto,
    ROUND((SUM(pm.MON_PRP_S1 + pm.MON_PRP_S2) * 100.0 / 
          (SELECT SUM(MON_PRP_S1 + MON_PRP_S2) 
           FROM PRP_METASS 
           WHERE YEA_PLA_OP = (SELECT MAX(YEA_PLA_OP) FROM PRP_METASS WHERE COMPANIA = 'PEREZZ')
             AND COMPANIA = 'PEREZZ'
             AND COD_AREA IS NOT NULL
             AND COD_OBJETI IS NOT NULL)), 2) AS porcentaje,
    '#3b82f6' AS color
FROM PRP_METASS pm
LEFT JOIN PRP_AREEST pa ON pm.COD_AREA = pa.COD_AREA 
                        AND pm.YEA_PLA_OP = pa.YEA_PLA_OP
                        AND pm.COMPANIA = pa.COMPANIA
LEFT JOIN PRP_OBJARE po ON pm.COD_AREA = po.COD_AREA 
                        AND pm.COD_OBJETI = po.COD_OBJETI
                        AND pm.YEA_PLA_OP = po.YEA_PLA_OP
                        AND pm.COMPANIA = po.COMPANIA
WHERE pm.YEA_PLA_OP = (
    SELECT MAX(YEA_PLA_OP) 
    FROM PRP_METASS 
    WHERE COMPANIA = 'PEREZZ'
)
AND pm.COMPANIA = 'PEREZZ'
AND pm.COD_AREA IS NOT NULL
AND pm.COD_OBJETI IS NOT NULL
AND (pm.MON_PRP_S1 + pm.MON_PRP_S2) > 0
GROUP BY pm.COD_AREA, pm.COD_OBJETI, pa.DES_AREA, po.DES_OBJETI
ORDER BY SUM(pm.MON_PRP_S1 + pm.MON_PRP_S2) DESC
