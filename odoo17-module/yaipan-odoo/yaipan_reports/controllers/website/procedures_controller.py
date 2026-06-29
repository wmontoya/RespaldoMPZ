import logging
from datetime import datetime
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class ProceduresController(http.Controller):
    """
    Controller unificado para todos los endpoints de análisis de trámites municipales.
    Maneja 4 endpoints diferentes usando configuración parametrizable.
    """

    def _handle_complex_endpoint(self, endpoint_key):
        """
        Maneja endpoints complejos (procedures-style) con estructura avanzada.
        """
        _logger.info(f"Iniciando consulta del endpoint complejo: {endpoint_key}")
        
        # Configuración directa sin herencia
        ENDPOINTS_CONFIG = {
            "monthly-evolution": {
                "title": "Evolución Mensual de Trámites Recibidos",
                "description": "Gráfico de líneas que muestra las tendencias y estacionalidad de los trámites recibidos por la municipalidad durante el año",
                "sql_file": "monthly_evolution.sql",
                "views": [
                    {
                        "type": "line",
                        "config": {
                            "title": "Trámites Recibidos por Mes",
                            "xAxisKey": "month",
                            "yAxisKey": "procedures",
                            "color": "#10b981"
                        }
                    },
                    {
                        "type": "table",
                        "config": {
                            "title": "Detalle Mensual de Trámites",
                            "columns": ["month", "procedures", "approved", "rejected", "approvalRate"],
                            "columnLabels": {
                                "month": "Mes",
                                "procedures": "Total Recibidos",
                                "approved": "Aprobados",
                                "rejected": "Rechazados",
                                "approvalRate": "Tasa de Aprobación (%)"
                            }
                        }
                    }
                ]
            },
            "rejection-rates": {
                "title": "Tasa de Rechazo o Devolución de Trámites",
                "description": "Análisis detallado de trámites rechazados o devueltos por requisitos incompletos, clasificados por motivo de rechazo",
                "sql_file": "rejection_rates.sql",
                "views": [
                    {
                        "type": "bar",
                        "config": {
                            "title": "Trámites Rechazados y Devueltos por Motivo",
                            "xAxisKey": "reason",
                            "yAxisKey": "total",
                            "color": "#ef4444"
                        }
                    },
                    {
                        "type": "table",
                        "config": {
                            "title": "Detalle de Rechazos y Devoluciones",
                            "columns": ["reason", "rejected", "returned", "total", "percentage"],
                            "columnLabels": {
                                "reason": "Motivo de Rechazo/Devolución",
                                "rejected": "Rechazados",
                                "returned": "Devueltos",
                                "total": "Total",
                                "percentage": "% del Total"
                            }
                        }
                    }
                ]
            },
            "procedures-by-type": {
                "title": "Cantidad de Trámites por Tipo último año",
                "description": "Análisis de los tipos de trámites más solicitados en la municipalidad, mostrando patentes, permisos, licencias y otros procedimientos administrativos",
                "sql_file": "procedures_by_type.sql",
                "views": [
                    {
                        "type": "pie",
                        "config": {
                            "title": "Distribución de Trámites por Tipo",
                            "dataKey": "count",
                            "nameKey": "type",
                            "showPercentage": True
                        }
                    },
                    {
                        "type": "bar",
                        "config": {
                            "title": "Cantidad de Trámites por Tipo último año",
                            "xAxisKey": "type",
                            "yAxisKey": "count",
                            "color": "#3b82f6"
                        }
                    },
                    {
                        "type": "table",
                        "config": {
                            "title": "Detalle de Trámites por Tipo",
                            "columns": ["type", "count", "percentage", "description"],
                            "columnLabels": {
                                "type": "Tipo de Trámite",
                                "count": "Cantidad",
                                "percentage": "Porcentaje",
                                "description": "Descripción"
                            }
                        }
                    }
                ]
            },
            "annual-growth": {
                "title": "Crecimiento de Trámites por Año",
                "description": "Análisis del crecimiento anual en el volumen de trámites municipales, mostrando tendencias, impactos de eventos externos y evolución de la demanda ciudadana",
                "sql_file": "annual_growth.sql",
                "views": [
                    {
                        "type": "line",
                        "config": {
                            "title": "Total de Trámites por Año",
                            "xAxisKey": "year",
                            "yAxisKey": "totalProcedures",
                            "color": "#1f2937"
                        }
                    },
                    {
                        "type": "table",
                        "config": {
                            "title": "Detalle por Tipo de Trámite",
                            "columns": ["year", "patentesComerciales", "permisosConstruccion", "licenciasFuncionamiento", "totalProcedures"],
                            "columnLabels": {
                                "year": "Año",
                                "patentesComerciales": "Patentes Comerciales",
                                "permisosConstruccion": "Permisos de Construcción",
                                "licenciasFuncionamiento": "Licencias de Funcionamiento",
                                "totalProcedures": "Total"
                            }
                        }
                    }
                ]
            }
        }
        
        # Ejecutar consulta directamente
        config = ENDPOINTS_CONFIG.get(endpoint_key, {})
        sql_file = config.get("sql_file")
        
        if not sql_file:
            response = self._build_complex_response(endpoint_key, [])
            response["error"] = {
                "message": f"Configuración SQL no encontrada para endpoint: {endpoint_key}",
                "success": False
            }
            return response
        
        # Construir ruta SQL
        sql_path = f"website/procedures/{sql_file}"
        
        try:
            # Ejecutar consulta Oracle
            data = request.env["yaipan_reports.oracle"].ejecutar_query_oracle(sql_path, {})
            response = self._build_complex_response(endpoint_key, data)
            _logger.info(f"Consulta {endpoint_key} ejecutada exitosamente. Registros: {len(data) if data else 0}")
            return response
        except Exception as e:
            response = self._build_complex_response(endpoint_key, [])
            response["error"] = {
                "message": str(e),
                "success": False
            }
            return response

    def _build_complex_response(self, endpoint_key, data):
        """
        Construye respuesta compleja para endpoints avanzados.
        """
        # Configuración directa
        ENDPOINTS_CONFIG = {
            "monthly-evolution": {
                "title": "Evolución Mensual de Trámites Recibidos",
                "description": "Gráfico de líneas que muestra las tendencias y estacionalidad de los trámites recibidos por la municipalidad durante el año",
                "sql_file": "monthly_evolution.sql",
                "views": [
                    {
                        "type": "line",
                        "config": {
                            "title": "Trámites Recibidos por Mes",
                            "xAxisKey": "month",
                            "yAxisKey": "procedures",
                            "color": "#10b981"
                        }
                    },
                    {
                        "type": "table",
                        "config": {
                            "title": "Detalle Mensual de Trámites",
                            "columns": ["month", "procedures", "approved", "rejected", "approvalRate"],
                            "columnLabels": {
                                "month": "Mes",
                                "procedures": "Total Recibidos",
                                "approved": "Aprobados",
                                "rejected": "Rechazados",
                                "approvalRate": "Tasa de Aprobación (%)"
                            }
                        }
                    }
                ]
            },
            "rejection-rates": {
                "title": "Tasa de Rechazo o Devolución de Trámites",
                "description": "Análisis detallado de trámites rechazados o devueltos por requisitos incompletos, clasificados por motivo de rechazo",
                "sql_file": "rejection_rates.sql",
                "views": [
                    {
                        "type": "bar",
                        "config": {
                            "title": "Trámites Rechazados y Devueltos por Motivo",
                            "xAxisKey": "reason",
                            "yAxisKey": "total",
                            "color": "#ef4444"
                        }
                    },
                    {
                        "type": "table",
                        "config": {
                            "title": "Detalle de Rechazos y Devoluciones",
                            "columns": ["reason", "rejected", "returned", "total", "percentage"],
                            "columnLabels": {
                                "reason": "Motivo de Rechazo/Devolución",
                                "rejected": "Rechazados",
                                "returned": "Devueltos",
                                "total": "Total",
                                "percentage": "% del Total"
                            }
                        }
                    }
                ]
            },
            "procedures-by-type": {
                "title": "Cantidad de Trámites por Tipo último año",
                "description": "Análisis de los tipos de trámites más solicitados en la municipalidad, mostrando patentes, permisos, licencias y otros procedimientos administrativos",
                "sql_file": "procedures_by_type.sql",
                "views": [
                    {
                        "type": "pie",
                        "config": {
                            "title": "Distribución de Trámites por Tipo",
                            "dataKey": "count",
                            "nameKey": "type",
                            "showPercentage": True
                        }
                    },
                    {
                        "type": "bar",
                        "config": {
                            "title": "Cantidad de Trámites por Tipo último año",
                            "xAxisKey": "type",
                            "yAxisKey": "count",
                            "color": "#3b82f6"
                        }
                    },
                    {
                        "type": "table",
                        "config": {
                            "title": "Detalle de Trámites por Tipo",
                            "columns": ["type", "count", "percentage", "description"],
                            "columnLabels": {
                                "type": "Tipo de Trámite",
                                "count": "Cantidad",
                                "percentage": "Porcentaje",
                                "description": "Descripción"
                            }
                        }
                    }
                ]
            },
            "annual-growth": {
                "title": "Crecimiento de Trámites por Año",
                "description": "Análisis del crecimiento anual en el volumen de trámites municipales, mostrando tendencias, impactos de eventos externos y evolución de la demanda ciudadana",
                "sql_file": "annual_growth.sql",
                "views": [
                    {
                        "type": "line",
                        "config": {
                            "title": "Total de Trámites por Año",
                            "xAxisKey": "year",
                            "yAxisKey": "totalProcedures",
                            "color": "#1f2937"
                        }
                    },
                    {
                        "type": "table",
                        "config": {
                            "title": "Detalle por Tipo de Trámite",
                            "columns": ["year", "patentesComerciales", "permisosConstruccion", "licenciasFuncionamiento", "totalProcedures"],
                            "columnLabels": {
                                "year": "Año",
                                "patentesComerciales": "Patentes Comerciales",
                                "permisosConstruccion": "Permisos de Construcción",
                                "licenciasFuncionamiento": "Licencias de Funcionamiento",
                                "totalProcedures": "Total"
                            }
                        }
                    }
                ]
            }
        }
        
        config = ENDPOINTS_CONFIG.get(endpoint_key, {})
        
        # Construir respuesta base
        response = {
            "title": config.get("title", "Análisis de Trámites"),
            "description": config.get("description", "Análisis de datos de trámites municipales"),
            "views": config.get("views", []),
            "data": data if data else []
        }
        
        # Agregar CSV
        response["csv"] = {
            "filename": f"tramites_{endpoint_key.replace('-', '_')}.csv",
            "headers": [],
            "data": []
        }
        
        # Agregar insights
        response["insights"] = self._generate_insights(endpoint_key, data)
        
        # Agregar metadata
        response["metadata"] = {
            "lastUpdated": datetime.now().isoformat(),
            "source": "Sistema Municipal de Gestión de Trámites",
            "recordCount": len(data) if data else 0,
            "endpoint": endpoint_key
        }
        
        return response

    def _generate_insights(self, endpoint_key, data):
        """
        Genera insights automáticos basados en los datos.
        """
        if not data:
            return ["No hay datos disponibles para generar insights de trámites."]
        
        insights = []
        
        try:
            if endpoint_key == "procedures-by-type":
                # Insights para tipos de trámites
                most_requested = max(data, key=lambda x: x.get('count', 0)) if data else {}
                total_count = sum(item.get('count', 0) for item in data)
                
                insights.extend([
                    f"Total de {total_count:,} trámites distribuidos en {len(data)} categorías",
                    f"El tipo más solicitado es '{most_requested.get('type', 'N/A')}' ({most_requested.get('percentage', 0):.1f}%)"
                ])
                
            elif endpoint_key == "monthly-evolution":
                total_procedures = sum(item.get('procedures', 0) for item in data)
                insights.append(f"Se procesaron {total_procedures:,} trámites en total")
                
            elif endpoint_key == "rejection-rates":
                total_issues = sum(item.get('total', 0) for item in data)
                insights.append(f"Se identificaron {total_issues:,} casos de rechazo o devolución")
                
            elif endpoint_key == "annual-growth":
                if len(data) >= 2:
                    insights.append("Análisis de crecimiento anual de trámites")
                else:
                    insights.append("Se requieren más datos históricos para análisis de tendencias")
                    
        except Exception as e:
            _logger.warning(f"Error generando insights para {endpoint_key}: {str(e)}")
            insights.append("Error generando análisis detallado de los datos")
        
        return insights

    # === ENDPOINTS INDIVIDUALES ===

    @http.route("/api/v1/yaipan_reports/procedures/monthly-evolution", type='json', auth='user', methods=['POST'], csrf=False)
    def get_monthly_evolution(self, **kwargs):
        """Endpoint para obtener la evolución mensual de trámites."""
        return self._handle_complex_endpoint("monthly-evolution")

    @http.route("/api/v1/yaipan_reports/procedures/rejection-rates", type='json', auth='user', methods=['POST'], csrf=False)
    def get_rejection_rates(self, **kwargs):
        """Endpoint para obtener las tasas de rechazo de trámites."""
        return self._handle_complex_endpoint("rejection-rates")

    @http.route("/api/v1/yaipan_reports/procedures/procedures-by-type", type='json', auth='user', methods=['POST'], csrf=False)
    def get_procedures_by_type(self, **kwargs):
        """Endpoint para obtener la distribución de trámites por tipo."""
        return self._handle_complex_endpoint("procedures-by-type")

    @http.route("/api/v1/yaipan_reports/procedures/annual-growth", type='json', auth='user', methods=['POST'], csrf=False)
    def get_annual_growth(self, **kwargs):
        """Endpoint para obtener el crecimiento anual de trámites."""
        return self._handle_complex_endpoint("annual-growth")