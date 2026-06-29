/*
==================================================
CONSULTA: Servicios de Planificación Urbana y Territorial
==================================================

INSTRUCCIONES PARA EL EQUIPO DE BD:
Esta consulta debe obtener los servicios y costos de planificación urbana y territorial.

CAMPOS REQUERIDOS EN EL RESULTADO:
- service (varchar): Nombre del servicio (ej: "Certificado de Uso de Suelo", "Visado de Planos")
- cost (numeric): Costo en colones (ej: 45000, 25000, 75000)

EJEMPLO DE DATOS ESPERADOS:
- service: "Certificado de Uso de Suelo", cost: 45000
- service: "Visado de Planos Constructivos", cost: 75000
- service: "Permiso de Construcción", cost: 125000

DATOS NECESARIOS:
- Servicios de planificación territorial disponibles
- Trámites urbanos y costos asociados
- Certificaciones y permisos municipales
- Tarifas vigentes según ordenanza municipal

NOTAS:
- Incluir solo servicios vigentes/disponibles
- Costos en colones costarricenses (números enteros)
- Nombres completos y descriptivos de servicios
- Ordenar por service alfabéticamente
*/

-- CONSULTA TEMPORAL PARA TESTING (REEMPLAZAR CON DATOS REALES)
SELECT 
    'Certificado de Uso de Suelo' as service,
    45000 as cost
FROM DUAL
UNION ALL
SELECT 
    'Visado de Planos Constructivos' as service,
    75000 as cost
FROM DUAL
UNION ALL
SELECT 
    'Permiso de Construcción' as service,
    125000 as cost
FROM DUAL
UNION ALL
SELECT 
    'Certificado de Habitabilidad' as service,
    35000 as cost
FROM DUAL
UNION ALL
SELECT 
    'Licencia de Demolición' as service,
    55000 as cost
FROM DUAL
ORDER BY service