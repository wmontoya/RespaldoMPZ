/*
==================================================
CONSULTA: Tarifas de Bienes Inmuebles, Parque y Ornato
==================================================

INSTRUCCIONES PARA EL EQUIPO DE BD:
Esta consulta debe obtener las tarifas de bienes inmuebles, parque y ornato.

CAMPOS REQUERIDOS EN EL RESULTADO:
- feeType (varchar): Tipo de tarifa (ej: "Tarifa BI Residencial", "Parque y Ornato")
- description (varchar): Descripción detallada (ej: "Bienes inmuebles uso residencial")
- value (numeric): Valor/monto en colones (ej: 15000, 12000, 8000)

EJEMPLO DE DATOS ESPERADOS:
- feeType: "Tarifa BI Residencial", description: "Bienes inmuebles uso residencial", value: 15000
- feeType: "Tarifa BI Comercial", description: "Bienes inmuebles uso comercial", value: 25000
- feeType: "Parque y Ornato", description: "Mantenimiento de parques y zonas verdes", value: 12000

DATOS NECESARIOS:
- Tipos de tarifas de bienes inmuebles vigentes
- Clasificaciones por uso de suelo (residencial, comercial, industrial)
- Tarifas de parque y ornato
- Valores/montos actualizados según ordenanza

NOTAS:
- Incluir solo tarifas vigentes/activas
- Valores en colones costarricenses (números enteros)
- Descripciones claras y completas
- Ordenar por feeType alfabéticamente
*/

-- CONSULTA TEMPORAL PARA TESTING (REEMPLAZAR CON DATOS REALES)
SELECT 
    'Tarifa BI Residencial' as feeType,
    'Bienes inmuebles uso residencial' as description,
    15000 as value
FROM DUAL
UNION ALL
SELECT 
    'Tarifa BI Comercial' as feeType,
    'Bienes inmuebles uso comercial' as description,
    25000 as value
FROM DUAL
UNION ALL
SELECT 
    'Parque y Ornato' as feeType,
    'Mantenimiento de parques y zonas verdes' as description,
    12000 as value
FROM DUAL
UNION ALL
SELECT 
    'Tarifa BI Industrial' as feeType,
    'Bienes inmuebles uso industrial' as description,
    35000 as value
FROM DUAL
ORDER BY feeType