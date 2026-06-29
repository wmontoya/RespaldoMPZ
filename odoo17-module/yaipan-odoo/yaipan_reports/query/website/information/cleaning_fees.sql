/*
==================================================
CONSULTA: Tarifas de Limpieza de Vías
==================================================

INSTRUCCIONES PARA EL EQUIPO DE BD:
Esta consulta debe obtener los costos de limpieza de vías por tipo de construcción y zona.

CAMPOS REQUERIDOS EN EL RESULTADO:
- construction (varchar): Tipo de construcción (ej: "Residencial", "Comercial", "Industrial")
- zone (varchar): Zona municipal (ej: "Centro", "Norte", "Sur", "Este", "Oeste")
- amount (numeric): Monto en colones (ej: 25000, 35000, 45000)

EJEMPLO DE DATOS ESPERADOS:
- construction: "Residencial", zone: "Centro", amount: 25000
- construction: "Comercial", zone: "Centro", amount: 35000
- construction: "Industrial", zone: "Norte", amount: 45000

DATOS NECESARIOS:
- Tipos/clasificaciones de construcción
- Zonas municipales definidas
- Tarifas vigentes por combinación construcción/zona
- Montos actualizados según ordenanza municipal

NOTAS:
- Retornar solo tarifas vigentes/activas
- Montos en colones costarricenses (números enteros)
- Ordenar por construction, luego por zone
*/

-- CONSULTA TEMPORAL PARA TESTING (REEMPLAZAR CON DATOS REALES)
SELECT 
    COD_TARIFA as codigo,
    CASE  
        WHEN COD_TARIFA = 'T1' THEN 'Casas Comercial'
        WHEN COD_TARIFA = 'T2' THEN 'Casas Residencial'
        WHEN COD_TARIFA = 'T3' THEN 'Comercios Residencial'
        WHEN COD_TARIFA = 'T4' THEN 'Mixto Residencial'
        WHEN COD_TARIFA = 'T5' THEN 'Comercios Comercial'
        WHEN COD_TARIFA = 'T6' THEN 'Mixto Comercial'
   
        
        ELSE COD_TARIFA
    END as descripcion,
    MON_TARIFA as monto,
    FEC_VIGENC as vigencia
FROM dec.CUF_TARIFA
WHERE AUX_CONTAB = 'CUF' 
    AND COD_SERVIC = 'LVP' 
ORDER BY COD_TARIFA