-- SQL Query para obtener el calendario de cobro municipal
-- Este archivo debe ser completado por el equipo de base de datos
-- 
-- Campos requeridos para el JSON de respuesta:
-- - concept: Concepto de cobro (ej: "Impuesto Predial", "Limpieza de Vías", etc.)
-- - description: Descripción detallada del servicio
-- - period: Período de cobro (ej: "Anual", "Mensual", "Por servicio")
-- - dueDate: Fecha de vencimiento (ej: "31/03/2024", "15 de cada mes")
--
-- TODO: Completar consulta SQL para obtener datos de calendario de cobro
-- 
-- Posibles tablas a consultar:
-- - Tabla de tarifas municipales
-- - Tabla de conceptos de cobro
-- - Tabla de fechas de vencimiento
-- - Tabla de períodos de facturación
--
SELECT 
    AUX_CONTAB as concept,
    CASE 
        WHEN AUX_CONTAB = 'CUF' THEN 'Cuota de Urbanización y Fiscalización'
        WHEN AUX_CONTAB = 'LIC' THEN 'Patente de Licencias'
        WHEN AUX_CONTAB = 'PAT' THEN 'Patente Comercial'
        WHEN AUX_CONTAB = 'BUS' THEN 'Servicio de Basura'
        WHEN AUX_CONTAB = 'CEM' THEN 'Cementerio Municipal'
        WHEN AUX_CONTAB = 'MER' THEN 'Mercado Municipal'
        ELSE AUX_CONTAB
    END as description,
    CASE 
        WHEN INSTR(TO_CHAR(COD_TRIMES), '.') > 0 THEN
            SUBSTR(TO_CHAR(COD_TRIMES), INSTR(TO_CHAR(COD_TRIMES), '.') + 1) || '/' || SUBSTR(TO_CHAR(COD_TRIMES), 1, INSTR(TO_CHAR(COD_TRIMES), '.') - 1)
        ELSE TO_CHAR(COD_TRIMES)
    END as period,
    FEC_VEN_PE as dueDate
FROM dec.CUF_PERCOB
WHERE COMPANIA = 'PEREZZ'
    AND FEC_VEN_PE >= SYSDATE
ORDER BY FEC_VEN_PE, AUX_CONTAB

