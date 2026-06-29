/*
 * Query: Budget Income - Ingresos del Presupuesto Municipal
 * Descripción: Análisis de las diferentes fuentes de ingresos que financian el presupuesto municipal
 * 
 * ESTRUCTURA ESPERADA DE RESPUESTA:
 * - incomeSource (string): Fuente de ingreso (ej: "Impuestos Municipales", "Transferencias del Gobierno Central")
 * - amount (number): Monto del ingreso en colones (ej: 3200000000)
 * - percentage (number): Porcentaje del total de ingresos (ej: 40.0)
 * - incomeType (string): Tipo de ingreso (ej: "Tributarios", "No Tributarios", "Transferencias")
 * 
 * NOTA PARA EL EQUIPO DE BD:
 * Esta consulta debe retornar las fuentes de ingresos municipales clasificadas por tipo.
 * El campo "amountInMillions" se calcula automáticamente en el controlador.
 * 
 * CAMPOS REQUERIDOS EN EL SELECT:
 * - incomeSource AS "incomeSource"
 * - amount AS "amount"
 * - percentage AS "percentage"
 * - incomeType AS "incomeType"
 * 
 * EJEMPLO DE RESPUESTA ESPERADA:
 * incomeSource                      | amount      | percentage | incomeType
 * ----------------------------------|-------------|------------|-------------
 * Impuestos Municipales            | 3200000000  | 40.0       | Tributarios
 * Transferencias del Gobierno Central| 2400000000  | 30.0       | Transferencias
 * Tasas y Derechos                 | 1200000000  | 15.0       | No Tributarios
 * Ingresos por Servicios           | 800000000   | 10.0       | No Tributarios
 * Multas y Sanciones               | 320000000   | 4.0        | No Tributarios
 * Ingresos Financieros             | 80000000    | 1.0        | No Tributarios
 */

-- PLACEHOLDER: Reemplazar con consulta real del equipo de BD
SELECT 
    'Impuestos Municipales' AS incomeSource,
    3200000000 AS amount,
    40.0 AS percentage,
    'Tributarios' AS incomeType
FROM DUAL
UNION ALL
SELECT 
    'Transferencias del Gobierno Central' AS incomeSource,
    2400000000 AS amount,
    30.0 AS percentage,
    'Transferencias' AS incomeType
FROM DUAL
UNION ALL
SELECT 
    'Tasas y Derechos' AS incomeSource,
    1200000000 AS amount,
    15.0 AS percentage,
    'No Tributarios' AS incomeType
FROM DUAL
UNION ALL
SELECT 
    'Ingresos por Servicios' AS incomeSource,
    800000000 AS amount,
    10.0 AS percentage,
    'No Tributarios' AS incomeType
FROM DUAL
UNION ALL
SELECT 
    'Multas y Sanciones' AS incomeSource,
    320000000 AS amount,
    4.0 AS percentage,
    'No Tributarios' AS incomeType
FROM DUAL
UNION ALL
SELECT 
    'Ingresos Financieros' AS incomeSource,
    80000000 AS amount,
    1.0 AS percentage,
    'No Tributarios' AS incomeType
FROM DUAL
ORDER BY amount DESC