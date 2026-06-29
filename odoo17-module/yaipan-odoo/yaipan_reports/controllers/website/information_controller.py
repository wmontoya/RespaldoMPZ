import logging
from datetime import datetime
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class InformationController(http.Controller):
    """
    Controller unificado para todos los endpoints de información municipal.
    Maneja 8 endpoints diferentes usando configuración parametrizable.
    """

    def _handle_standard_endpoint(self, endpoint_key):
        """
        Maneja endpoints estándar (information-style) con estructura simple.
        """
        _logger.info(f"Iniciando consulta del endpoint estándar: {endpoint_key}")
        
        # Configuración directa sin herencia
        ENDPOINTS_CONFIG = {
            "billing-calendar": {
                "title": "Calendario de Cobro",
                "description": "Calendario de vencimientos y fechas de cobro",
                "sql_file": "billing_calendar.sql",
                "columns": ["concept", "description", "period", "dueDate"],
                "column_titles": {
                    "concept": "Concepto",
                    "description": "Descripción", 
                    "period": "Período",
                    "dueDate": "Fecha Vencimiento"
                },
                "table_title": "Calendario de Cobro"
            },
            "interest-rates": {
                "title": "Tabla de Intereses",
                "description": "Tasas de interés aplicables por rubro",
                "sql_file": "interest_rates.sql",
                "columns": ["category", "interestRate"],
                "column_titles": {
                    "category": "Rubro",
                    "interestRate": "Interés (%)"
                },
                "table_title": "Intereses por Rubro"
            },
            "cleaning-fees": {
                "title": "Tarifas de Limpieza de Vías",
                "description": "Costos de limpieza por tipo de construcción y zona",
                "sql_file": "cleaning_fees.sql",
                "columns": ["construction", "zone", "amount"],
                "column_titles": {
                    "construction": "Construcción",
                    "zone": "Zona",
                    "amount": "Monto"
                },
                "table_title": "Tarifas de Limpieza"
            },
            "rental-locations": {
                "title": "Alquiler de Locales",
                "description": "Locales municipales disponibles para alquiler",
                "sql_file": "rental_locations.sql",
                "columns": ["id", "address", "price"],
                "column_titles": {
                    "id": "ID",
                    "address": "Dirección",
                    "price": "Precio"
                },
                "table_title": "Locales en Alquiler"
            },
            "real-estate": {
                "title": "Bienes Inmuebles",
                "description": "Tarifas de bienes inmuebles, parque y ornato",
                "sql_file": "real_estate.sql",
                "columns": ["feeType", "description", "value"],
                "column_titles": {
                    "feeType": "Tipo de Tarifa",
                    "description": "Descripción",
                    "value": "Valor"
                },
                "table_title": "Tarifas de Bienes Inmuebles"
            },
            "licenses-permits": {
                "title": "Licencias y Patentes",
                "description": "Tarifas de licencias comerciales y patentes municipales",
                "sql_file": "licenses_permits.sql",
                "columns": ["category", "fee"],
                "column_titles": {
                    "category": "Categoría",
                    "fee": "Tarifa"
                },
                "table_title": "Tarifas por Categoría"
            },
            "territorial-planning": {
                "title": "Planificación Territorial",
                "description": "Servicios de planificación urbana y territorial",
                "sql_file": "territorial_planning.sql",
                "columns": ["service", "cost"],
                "column_titles": {
                    "service": "Servicio",
                    "cost": "Costo"
                },
                "table_title": "Costos de Servicios"
            },
            "cemetery": {
                "title": "Cementerio Municipal", 
                "description": "Tarifas vigentes del cementerio municipal",
                "sql_file": "cemetery.sql",
                "columns": ["codigo", "descripcion", "monto", "vigencia"],
                "column_titles": {
                    "codigo": "Código",
                    "descripcion": "Descripción",
                    "monto": "Monto (₡)",
                    "vigencia": "Vigencia"
                },
                "table_title": "Tarifas del Cementerio"
            }
        }
        
        # Ejecutar consulta directamente
        config = ENDPOINTS_CONFIG.get(endpoint_key, {})
        sql_file = config.get("sql_file")
        
        if not sql_file:
            response = self._build_standard_response(endpoint_key, [])
            response["error"] = {
                "message": f"Configuración SQL no encontrada para endpoint: {endpoint_key}",
                "success": False
            }
            return response
        
        # Construir ruta SQL
        sql_path = f"website/information/{sql_file}"
        
        try:
            # Ejecutar consulta Oracle
            data = request.env["yaipan_reports.oracle"].ejecutar_query_oracle(sql_path, {})
            response = self._build_standard_response(endpoint_key, data)
            _logger.info(f"Consulta {endpoint_key} ejecutada exitosamente. Registros: {len(data) if data else 0}")
            return response
        except Exception as e:
            response = self._build_standard_response(endpoint_key, [])
            response["error"] = {
                "message": str(e),
                "success": False
            }
            return response

    def _build_standard_response(self, endpoint_key, data):
        """
        Construye respuesta estándar para endpoints simples.
        """
        # Configuración directa
        ENDPOINTS_CONFIG = {
            "billing-calendar": {
                "title": "Calendario de Cobro",
                "description": "Calendario de vencimientos y fechas de cobro",
                "sql_file": "billing_calendar.sql",
                "columns": ["concept", "description", "period", "dueDate"],
                "column_titles": {
                    "concept": "Concepto",
                    "description": "Descripción", 
                    "period": "Período",
                    "dueDate": "Fecha Vencimiento"
                },
                "table_title": "Calendario de Cobro"
            },
            "interest-rates": {
                "title": "Tabla de Intereses",
                "description": "Tasas de interés aplicables por rubro",
                "sql_file": "interest_rates.sql",
                "columns": ["category", "interestRate"],
                "column_titles": {
                    "category": "Rubro",
                    "interestRate": "Interés (%)"
                },
                "table_title": "Intereses por Rubro"
            },
            "cleaning-fees": {
                "title": "Tarifas de Limpieza de Vías",
                "description": "Costos de limpieza por tipo de construcción y zona",
                "sql_file": "cleaning_fees.sql",
                "columns": ["construction", "zone", "amount"],
                "column_titles": {
                    "construction": "Construcción",
                    "zone": "Zona",
                    "amount": "Monto"
                },
                "table_title": "Tarifas de Limpieza"
            },
            "rental-locations": {
                "title": "Alquiler de Locales",
                "description": "Locales municipales disponibles para alquiler",
                "sql_file": "rental_locations.sql",
                "columns": ["id", "address", "price"],
                "column_titles": {
                    "id": "ID",
                    "address": "Dirección",
                    "price": "Precio"
                },
                "table_title": "Locales en Alquiler"
            },
            "real-estate": {
                "title": "Bienes Inmuebles",
                "description": "Tarifas de bienes inmuebles, parque y ornato",
                "sql_file": "real_estate.sql",
                "columns": ["feeType", "description", "value"],
                "column_titles": {
                    "feeType": "Tipo de Tarifa",
                    "description": "Descripción",
                    "value": "Valor"
                },
                "table_title": "Tarifas de Bienes Inmuebles"
            },
            "licenses-permits": {
                "title": "Licencias y Patentes",
                "description": "Tarifas de licencias comerciales y patentes municipales",
                "sql_file": "licenses_permits.sql",
                "columns": ["category", "fee"],
                "column_titles": {
                    "category": "Categoría",
                    "fee": "Tarifa"
                },
                "table_title": "Tarifas por Categoría"
            },
            "territorial-planning": {
                "title": "Planificación Territorial",
                "description": "Servicios de planificación urbana y territorial",
                "sql_file": "territorial_planning.sql",
                "columns": ["service", "cost"],
                "column_titles": {
                    "service": "Servicio",
                    "cost": "Costo"
                },
                "table_title": "Costos de Servicios"
            },
            "cemetery": {
                "title": "Cementerio Municipal", 
                "description": "Tarifas vigentes del cementerio municipal",
                "sql_file": "cemetery.sql",
                "columns": ["codigo", "descripcion", "monto", "vigencia"],
                "column_titles": {
                    "codigo": "Código",
                    "descripcion": "Descripción",
                    "monto": "Monto (₡)",
                    "vigencia": "Vigencia"
                },
                "table_title": "Tarifas del Cementerio"
            }
        }
        
        config = ENDPOINTS_CONFIG.get(endpoint_key, {})
        
        return {
            "title": config.get("title", "Información Municipal"),
            "description": config.get("description", "Datos municipales"),
            "views": [
                {
                    "type": "table",
                    "config": {
                        "title": config.get("table_title", "Tabla de Datos"),
                        "columns": config.get("columns", []),
                        "columnTitles": config.get("column_titles", {})
                    }
                }
            ],
            "data": data if data else []
        }

    # === ENDPOINTS INDIVIDUALES ===

    @http.route("/api/v1/yaipan_reports/information/billing-calendar", type='json', auth='user', methods=['POST'], csrf=False)
    def get_billing_calendar(self, **kwargs):
        """Endpoint para obtener el calendario de cobro municipal."""
        return self._handle_standard_endpoint("billing-calendar")

    @http.route("/api/v1/yaipan_reports/information/interest-rates", type='json', auth='user', methods=['POST'], csrf=False)
    def get_interest_rates(self, **kwargs):
        """Endpoint para obtener las tasas de interés por rubro."""
        return self._handle_standard_endpoint("interest-rates")

    @http.route("/api/v1/yaipan_reports/information/cleaning-fees", type='json', auth='user', methods=['POST'], csrf=False)
    def get_cleaning_fees(self, **kwargs):
        """Endpoint para obtener las tarifas de limpieza de vías."""
        return self._handle_standard_endpoint("cleaning-fees")

    @http.route("/api/v1/yaipan_reports/information/cemetery", type='json', auth='user', methods=['POST'], csrf=False)
    def get_cemetery(self, **kwargs):
        """Endpoint para obtener información del personal del cementerio."""
        return self._handle_standard_endpoint("cemetery")