/*
==================================================
CONSULTA: Locales Municipales para Alquiler
==================================================

INSTRUCCIONES PARA EL EQUIPO DE BD:
Esta consulta debe obtener los locales municipales disponibles para alquiler.

CAMPOS REQUERIDOS EN EL RESULTADO:
- id (varchar): Identificador único del local (ej: "LOC-001", "LOC-002")
- address (varchar): Dirección completa del local (ej: "Av. Principal 123, San Isidro")
- price (numeric): Precio de alquiler mensual en colones (ej: 350000, 275000)

EJEMPLO DE DATOS ESPERADOS:
- id: "LOC-001", address: "Av. Principal 123, San Isidro", price: 350000
- id: "LOC-002", address: "Calle Central 456, Centro", price: 275000
- id: "LOC-003", address: "Boulevard Los Lagos 789", price: 420000

DATOS NECESARIOS:
- Inventario de locales municipales disponibles
- Direcciones completas y exactas
- Precios de alquiler actualizados
- Estado de disponibilidad (solo incluir disponibles)

NOTAS:
- Incluir solo locales disponibles para alquiler
- Precios en colones costarricenses (números enteros)
- Direcciones completas con referencias
- Ordenar por price (menor a mayor)
*/

-- CONSULTA TEMPORAL PARA TESTING (REEMPLAZAR CON DATOS REALES)
SELECT 
    'LOC-001' as id,
    'Av. Principal 123, San Isidro' as address,
    350000 as price
FROM DUAL
UNION ALL
SELECT 
    'LOC-002' as id,
    'Calle Central 456, Centro' as address,
    275000 as price
FROM DUAL
UNION ALL
SELECT 
    'LOC-003' as id,
    'Boulevard Los Lagos 789, Zona Norte' as address,
    420000 as price
FROM DUAL
ORDER BY price