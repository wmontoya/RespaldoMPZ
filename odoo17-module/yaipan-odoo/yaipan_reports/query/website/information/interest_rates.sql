/*
==================================================
CONSULTA: Tasas de Interés por Rubro Municipal
==================================================

INSTRUCCIONES PARA EL EQUIPO DE BD:
Esta consulta debe obtener las tasas de interés aplicables por cada rubro municipal.

CAMPOS REQUERIDOS EN EL RESULTADO:
- category (varchar): Nombre del rubro/categoría (ej: "Impuesto Predial", "Licencias Comerciales")  
- interestRate (numeric): Porcentaje de interés por mora (ej: 1.5, 2.0, 2.5)

EJEMPLO DE DATOS ESPERADOS:
- category: "Impuesto Predial", interestRate: 1.5
- category: "Licencias Comerciales", interestRate: 2.0
- category: "Servicios Municipales", interestRate: 1.8

DATOS NECESARIOS:
- Categorías/rubros de servicios municipales
- Tasas de interés vigentes por mora/retraso  
- Porcentajes actualizados según regulación municipal

NOTAS:
- Retornar solo las tasas vigentes/activas
- Los porcentajes deben ser números (no strings)
- Ordenar por category alfabéticamente
*/

SELECT 
    CASE 
        WHEN AUX_CONTAB = 'CUF' THEN 'Cobros sobre Propiedades'
        WHEN AUX_CONTAB = 'BUS' THEN 'Tarifas de buses'
        WHEN AUX_CONTAB = 'LIC' THEN 'Licencias Comerciales'
        WHEN AUX_CONTAB = 'PAT' THEN 'Patentes Comerciales'
        WHEN AUX_CONTAB = 'CEM' THEN 'Cementerio Municipal'
        WHEN AUX_CONTAB = 'MER' THEN 'Mercado Municipal'
        ELSE AUX_CONTAB
    END as category,
    ROUND(POR_INT_ME , 3) as interestRate
FROM dec.cuf_tasaux
WHERE COMPANIA = 'PEREZZ'
    AND EXTRACT(YEAR FROM FEC_INI_VI) = EXTRACT(YEAR FROM SYSDATE)
ORDER BY AUX_CONTAB