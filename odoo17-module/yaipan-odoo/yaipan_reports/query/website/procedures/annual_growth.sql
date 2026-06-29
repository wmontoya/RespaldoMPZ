-- =============================================================================
-- CONSULTA: Crecimiento Anual de Trámites por Tipo
-- DESCRIPCIÓN: Análisis histórico de crecimiento anual con desglose por tipo
-- ENDPOINT: /api/v1/procedures/annual-growth
-- =============================================================================

-- NOTA PARA EL EQUIPO DE BASE DE DATOS:
-- Esta consulta debe retornar los siguientes campos por año:
-- - year: Año como string (ej: "2019", "2020", "2021", etc.)
-- - patentesComerciales: Cantidad de patentes comerciales
-- - permisosConstruccion: Cantidad de permisos de construcción
-- - licenciasFuncionamiento: Cantidad de licencias de funcionamiento
-- - certificacionesUsoSuelo: Cantidad de certificaciones de uso de suelo
-- - permisosEventos: Cantidad de permisos de eventos
-- - licenciasLicor: Cantidad de licencias de licor
-- - permisosAmbientales: Cantidad de permisos ambientales
-- - licenciasTransporte: Cantidad de licencias de transporte
-- - ocupacionVia: Cantidad de permisos de ocupación de vía
-- - otrosTramites: Cantidad de otros trámites no clasificados
-- - totalProcedures: Total de trámites del año
-- - growthRate: Tasa de crecimiento vs año anterior (%)
-- - description: Descripción del año (ej: "Año de crecimiento estable")

-- PERÍODO: Últimos 6 años (2019-2024)
-- CÁLCULO CRECIMIENTO: (año_actual - año_anterior) / año_anterior * 100
-- ORDENAR: Por año ascendente

-- MAPPING DE TIPOS (ajustar según la BD):
-- patentes_comerciales -> patentesComerciales
-- permisos_construccion -> permisosConstruccion
-- licencias_funcionamiento -> licenciasFuncionamiento
-- etc.

-- Consulta de crecimiento anual con desglose por tipo de trámite usando dec.CUF_sercli
WITH tramites_por_tipo_y_ano AS (
    SELECT 
        TO_CHAR(FEC_REGIST, 'YYYY') AS year,
        -- Clasificación de tipos usando la misma lógica que procedures-by-type
        SUM(CASE 
            WHEN TIP_DOCUME IN ('PAT') OR COD_SERVIC IN ('PAT', 'COM') THEN 1 
            ELSE 0 
        END) AS patentesComerciales,
        
        SUM(CASE 
            WHEN TIP_DOCUME IN ('CUF') AND COD_SERVIC IN ('PLU', 'SUS', 'IBI') THEN 1 
            ELSE 0 
        END) AS permisosConstruccion,
        
        SUM(CASE 
            WHEN TIP_DOCUME IN ('LIC') OR COD_SERVIC IN ('LIC', 'SLL') THEN 1 
            ELSE 0 
        END) AS licenciasFuncionamiento,
        
        SUM(CASE 
            WHEN TIP_DOCUME IN ('CUF') AND COD_SERVIC IN ('CAT', 'GCO') THEN 1 
            ELSE 0 
        END) AS certificacionesUsoSuelo,
        
        SUM(CASE 
            WHEN TIP_DOCUME IN ('EVE') OR COD_SERVIC IN ('EVE', 'ACT') THEN 1 
            ELSE 0 
        END) AS permisosEventos,
        
        SUM(CASE 
            WHEN TIP_DOCUME IN ('LIQ') OR COD_SERVIC IN ('LIQ', 'ALC') THEN 1 
            ELSE 0 
        END) AS licenciasLicor,
        
        SUM(CASE 
            WHEN COD_SERVIC IN ('AMB', 'ECO', 'CIAT') THEN 1 
            ELSE 0 
        END) AS permisosAmbientales,
        
        SUM(CASE 
            WHEN TIP_DOCUME IN ('TRA') OR COD_SERVIC IN ('TRA', 'MOV') THEN 1 
            ELSE 0 
        END) AS licenciasTransporte,
        
        SUM(CASE 
            WHEN COD_SERVIC IN ('VIA', 'OCP', 'VAR') THEN 1 
            ELSE 0 
        END) AS ocupacionVia,
        
        -- Total por año
        COUNT(*) AS totalProcedures
    FROM dec.CUF_sercli
    WHERE FEC_REGIST IS NOT NULL
      AND FEC_REGIST >= TO_DATE('2020-01-01', 'YYYY-MM-DD')
      AND FEC_REGIST <= SYSDATE
    GROUP BY TO_CHAR(FEC_REGIST, 'YYYY')
),
tramites_con_otros AS (
    SELECT 
        year,
        patentesComerciales,
        permisosConstruccion,
        licenciasFuncionamiento,
        certificacionesUsoSuelo,
        permisosEventos,
        licenciasLicor,
        permisosAmbientales,
        licenciasTransporte,
        ocupacionVia,
        -- Calcular "otros trámites" como la diferencia
        GREATEST(0, totalProcedures - patentesComerciales - permisosConstruccion - 
                 licenciasFuncionamiento - certificacionesUsoSuelo - permisosEventos - 
                 licenciasLicor - permisosAmbientales - licenciasTransporte - ocupacionVia) AS otrosTramites,
        totalProcedures,
        -- Calcular tasa de crecimiento vs año anterior
        CASE 
            WHEN LAG(totalProcedures) OVER (ORDER BY year) IS NULL THEN 0.0
            WHEN LAG(totalProcedures) OVER (ORDER BY year) = 0 THEN 0.0
            ELSE ROUND(
                ((totalProcedures - LAG(totalProcedures) OVER (ORDER BY year)) * 100.0 / 
                 LAG(totalProcedures) OVER (ORDER BY year)), 1
            )
        END AS growthRate
    FROM tramites_por_tipo_y_ano
)
SELECT 
    year,
    patentesComerciales,
    permisosConstruccion,
    licenciasFuncionamiento,
    certificacionesUsoSuelo,
    permisosEventos,
    licenciasLicor,
    permisosAmbientales,
    licenciasTransporte,
    ocupacionVia,
    otrosTramites,
    totalProcedures,
    growthRate,
    CASE 
        WHEN year = '2020' THEN 'Año base - Inicio pandemia'
        WHEN year = '2021' THEN 'Recuperación post-pandemia (' || 
            CASE WHEN growthRate > 0 THEN '+' ELSE '' END || growthRate || '%)'
        WHEN year = '2022' THEN 'Normalización económica (' || 
            CASE WHEN growthRate > 0 THEN '+' ELSE '' END || growthRate || '%)'
        WHEN year = '2023' THEN 'Crecimiento estable (' || 
            CASE WHEN growthRate > 0 THEN '+' ELSE '' END || growthRate || '%)'
        WHEN year = '2024' THEN 'Año actual (' || 
            CASE WHEN growthRate > 0 THEN '+' ELSE '' END || growthRate || '%)'
        WHEN growthRate > 20 THEN 'Crecimiento acelerado (+' || growthRate || '%)'
        WHEN growthRate > 0 THEN 'Crecimiento (' || growthRate || '%)'
        WHEN growthRate = 0 THEN 'Sin cambios'
        ELSE 'Decrecimiento (' || growthRate || '%)'
    END AS description
FROM tramites_con_otros
ORDER BY year