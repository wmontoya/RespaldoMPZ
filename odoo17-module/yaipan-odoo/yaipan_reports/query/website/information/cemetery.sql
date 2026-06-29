/*
==================================================
CONSULTA: Tarifas del Cementerio Municipal
==================================================

INSTRUCCIONES PARA EL EQUIPO DE BD:
Esta consulta debe obtener las tarifas vigentes del cementerio municipal desde la tabla dec.CUF_TARIFA.

CAMPOS REQUERIDOS EN EL RESULTADO:
- codigo (varchar): Código de la tarifa (1N, 1P, 2P, 4P)
- descripcion (varchar): Descripción de la tarifa
- monto (numeric): Monto de la tarifa en colones
- vigencia (date): Fecha de vigencia

TABLA FUENTE: dec.CUF_TARIFA
CONDICIONES: 
- SVC = 'CEM' (Servicio de Cementerio)
- CODIGO IN ('1N', '1P', '2P', '4P')
- Vigencia actualizada

EJEMPLO DE DATOS ESPERADOS:
- codigo: "1N", descripcion: "1 Niño", monto: 25000, vigencia: "2024-01-01"
- codigo: "1P", descripcion: "1 Persona", monto: 45000, vigencia: "2024-01-01"
- codigo: "2P", descripcion: "2 Personas", monto: 75000, vigencia: "2024-01-01"
- codigo: "4P", descripcion: "4 Personas", monto: 125000, vigencia: "2024-01-01"

NOTAS:
- Incluir solo tarifas vigentes
- Ordenar por código
- Montos en colones costarricenses
*/

SELECT 
    COD_TARIFA as codigo,
    CASE 
        WHEN COD_TARIFA = '1 N' THEN '1 Niño'
        WHEN COD_TARIFA = '1 P' THEN '1 Persona'
        WHEN COD_TARIFA = '2 P' THEN '2 Personas'
        WHEN COD_TARIFA = '4 P' THEN '4 Personas'
        ELSE COD_TARIFA
    END as descripcion,
    MON_TARIFA as monto,
    FEC_VIGENC as vigencia
FROM dec.CUF_TARIFA
WHERE AUX_CONTAB = 'CEM' 
    AND COD_SERVIC = 'CEM'
    AND COD_TARIFA IN ('1 N', '1 P', '2 P', '4 P')

ORDER BY COD_TARIFA



-- SELECT 
--     CASE 
--         WHEN COD_TARIFA = '1 N' THEN '1 niño'
--         WHEN COD_TARIFA = '2 P' THEN '2 Personas'
--         WHEN COD_TARIFA = '3 P' THEN '3 Personas'
--         WHEN COD_TARIFA = '4 P' THEN '4 Personas' 
--         ELSE COD_TARIFA
--     END AS COD_TARIFA,
--     MON_TARIFA,
--     FEC_VIGENCIA
-- FROM dec.cuf_tarifa
-- WHERE AUX_CONTAB = 'CEM' 
--     AND COD_SERVIC = 'CEM'
-- ORDER BY COD_TARIFA, FEC_VIGENCIA DESC