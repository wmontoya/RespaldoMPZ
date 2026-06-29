/*
==================================================
CONSULTA: Tarifas de Licencias Comerciales y Patentes Municipales
==================================================

INSTRUCCIONES PARA EL EQUIPO DE BD:
Esta consulta debe obtener las tarifas de licencias comerciales y patentes municipales.

CAMPOS REQUERIDOS EN EL RESULTADO:
- category (varchar): Categoría de actividad comercial (ej: "Comercio Minorista", "Servicios Profesionales")
- fee (numeric): Tarifa en colones (ej: 125000, 85000, 200000)

EJEMPLO DE DATOS ESPERADOS:
- category: "Comercio Minorista", fee: 125000
- category: "Servicios Profesionales", fee: 85000  
- category: "Restaurantes y Cafeterías", fee: 200000

DATOS NECESARIOS:
- Categorías de actividades comerciales según clasificación municipal
- Tarifas por tipo de licencia/patente
- Clasificaciones de negocios vigentes
- Montos actualizados según ordenanza municipal

NOTAS:
- Incluir solo categorías y tarifas vigentes
- Tarifas en colones costarricenses (números enteros)
- Categorías específicas según clasificación municipal
- Ordenar por category alfabéticamente
*/

-- CONSULTA TEMPORAL PARA TESTING (REEMPLAZAR CON DATOS REALES)
SELECT 
    'Comercio Minorista' as category,
    125000 as fee
FROM DUAL
UNION ALL
SELECT 
    'Servicios Profesionales' as category,
    85000 as fee
FROM DUAL
UNION ALL
SELECT 
    'Restaurantes y Cafeterías' as category,
    200000 as fee
FROM DUAL
UNION ALL
SELECT 
    'Talleres y Mecánicas' as category,
    150000 as fee
FROM DUAL
UNION ALL
SELECT 
    'Supermercados' as category,
    300000 as fee
FROM DUAL
ORDER BY category