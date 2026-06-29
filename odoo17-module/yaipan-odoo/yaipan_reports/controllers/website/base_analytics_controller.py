
import logging
from datetime import datetime
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class BaseAnalyticsController(http.Controller):
    """
    Clase base abstracta para controllers de analytics municipales.
    Proporciona funcionalidad común para information, procedures y budget controllers.
    
    Implementa el patrón Template Method para reutilizar código común mientras permite
    personalización específica en las subclases.
    """

    # Configuración por defecto que pueden sobrescribir las subclases
    _DEFAULT_GLOBAL_CONFIG = {
        "cache_control": "public, max-age=3600",  # Cache de 1 hora por defecto
        "content_type": "application/json"
    }

    @property
    def _GLOBAL_CONFIG(self):
        """Configuración global específica del controller. Debe ser implementada por subclases."""
        raise NotImplementedError("Las subclases deben implementar _GLOBAL_CONFIG")

    @property
    def _ENDPOINTS_CONFIG(self):
        """Configuración de endpoints específica del controller. Debe ser implementada por subclases."""
        raise NotImplementedError("Las subclases deben implementar _ENDPOINTS_CONFIG")

    @property
    def _SQL_DIRECTORY(self):
        """Directorio donde están los archivos SQL. Ej: 'website/information'"""
        raise NotImplementedError("Las subclases deben implementar _SQL_DIRECTORY")

    def _build_standard_response(self, endpoint_key, data):
        """
        Construye respuesta estándar para endpoints simples (information-style).
        
        Args:
            endpoint_key (str): Clave del endpoint en _ENDPOINTS_CONFIG
            data (list): Datos obtenidos de la consulta SQL
            
        Returns:
            dict: Respuesta JSON en formato estándar
        """
        config = self._ENDPOINTS_CONFIG.get(endpoint_key, {})
        
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

    def _build_complex_response(self, endpoint_key, data):
        """
        Construye respuesta compleja para endpoints avanzados (procedures/budget-style).
        
        Args:
            endpoint_key (str): Clave del endpoint en _ENDPOINTS_CONFIG
            data (list): Datos obtenidos de la consulta SQL
            
        Returns:
            dict: Respuesta JSON compleja con views, insights y metadata
        """
        config = self._ENDPOINTS_CONFIG.get(endpoint_key, {})
        
        # Construir respuesta base
        response = {
            "title": config.get("title", "Análisis Municipal"),
            "description": config.get("description", "Análisis de datos municipales"),
            "views": config.get("views", []),
            "data": data if data else []
        }
        
        # Agregar CSV si está configurado
        if config.get("csv"):
            response["csv"] = self._build_csv_export(config["csv"], data)
        
        # Agregar insights automáticos
        if config.get("generate_insights", True):
            response["insights"] = self._generate_insights(endpoint_key, data)
        
        # Agregar metadata
        response["metadata"] = self._build_metadata(endpoint_key, data)
        
        return response

    def _build_csv_export(self, csv_config, data):
        """
        Construye el objeto CSV para exportación.
        
        Args:
            csv_config (dict): Configuración CSV del endpoint
            data (list): Datos para exportar
            
        Returns:
            dict: Objeto CSV con filename, headers y data
        """
        csv_data = []
        
        if data and csv_config.get("data_mapper"):
            # Usar mapper personalizado si está definido
            for item in data:
                mapped_row = csv_config["data_mapper"](item)
                csv_data.append(mapped_row)
        else:
            # Usar datos tal como vienen de la consulta
            for item in data:
                row = []
                for header in csv_config.get("headers", []):
                    # Mapear de inglés a valores apropiados para CSV
                    row.append(str(item.get(header.lower().replace(" ", "_"), "")))
                csv_data.append(row)
        
        return {
            "filename": csv_config.get("filename", "datos_municipales.csv"),
            "headers": csv_config.get("headers", []),
            "data": csv_data
        }

    def _generate_insights(self, endpoint_key, data):
        """
        Genera insights automáticos basados en los datos.
        Las subclases pueden sobrescribir este método para insights específicos.
        
        Args:
            endpoint_key (str): Clave del endpoint
            data (list): Datos para analizar
            
        Returns:
            list: Lista de insights automáticos
        """
        if not data:
            return ["No hay datos disponibles para generar insights."]
        
        insights = []
        insights.append(f"Se encontraron {len(data)} registros en el análisis.")
        
        # Las subclases pueden implementar lógica específica sobrescribiendo este método
        return insights

    def _build_metadata(self, endpoint_key, data):
        """
        Construye metadata estándar para la respuesta.
        Las subclases pueden extender este método para metadata específica.
        
        Args:
            endpoint_key (str): Clave del endpoint
            data (list): Datos para incluir en metadata
            
        Returns:
            dict: Metadata del endpoint
        """
        return {
            "lastUpdated": datetime.now().isoformat(),
            "source": "Sistema Municipal de Gestión - Odoo",
            "recordCount": len(data) if data else 0,
            "endpoint": endpoint_key
        }

    def _execute_query(self, endpoint_key):
        """
        Ejecuta la consulta SQL para un endpoint específico.
        
        Args:
            endpoint_key (str): Clave del endpoint en _ENDPOINTS_CONFIG
            
        Returns:
            tuple: (success: bool, result: list, error_message: str)
        """
        try:
            config = self._ENDPOINTS_CONFIG.get(endpoint_key, {})
            sql_file = config.get("sql_file")
            
            if not sql_file:
                return False, [], f"Configuración SQL no encontrada para endpoint: {endpoint_key}"
            
            # Construir ruta completa del archivo SQL
            sql_path = f"{self._SQL_DIRECTORY}/{sql_file}"
            
            # Ejecutar consulta SQL usando el conector Oracle
            result = request.env["yaipan_reports.oracle"].ejecutar_query_oracle(
                sql_path, {}
            )
            
            return True, result, None
            
        except Exception as e:
            # Capturar específicamente errores de Oracle
            from odoo.exceptions import UserError
            if isinstance(e, UserError):
                error_msg = str(e)
            else:
                error_msg = f"Error al ejecutar consulta {endpoint_key}: {str(e)}"
            
            _logger.error(error_msg)
            return False, [], error_msg

    def _set_response_headers(self, error=False):
        """
        Configura los headers HTTP estándar para las respuestas.
        En Odoo 17 con type='json', los headers se manejan automáticamente.
        
        Args:
            error (bool): Si es True, configura status code 500 (no aplicable para JSON)
        """
        # Para endpoints type='json', Odoo maneja automáticamente los headers
        # Content-Type: application/json y otros headers estándar
        pass

    def _handle_standard_endpoint(self, endpoint_key):
        """
        Maneja endpoints estándar (information-style) con estructura simple.
        
        Args:
            endpoint_key (str): Clave del endpoint en _ENDPOINTS_CONFIG
            
        Returns:
            dict: Respuesta JSON del endpoint
        """
        _logger.info(f"Iniciando consulta del endpoint estándar: {endpoint_key}")
        
        success, data, error_msg = self._execute_query(endpoint_key)
        
        if success:
            response = self._build_standard_response(endpoint_key, data)
            self._set_response_headers()
            _logger.info(f"Consulta {endpoint_key} ejecutada exitosamente. Registros: {len(data) if data else 0}")
            return response
        else:
            # Respuesta de error manteniendo estructura estándar
            response = self._build_standard_response(endpoint_key, [])
            response["error"] = {
                "message": error_msg,
                "success": False
            }
            self._set_response_headers(error=True)
            return response

    def _handle_complex_endpoint(self, endpoint_key):
        """
        Maneja endpoints complejos (procedures/budget-style) con múltiples views e insights.
        
        Args:
            endpoint_key (str): Clave del endpoint en _ENDPOINTS_CONFIG
            
        Returns:
            dict: Respuesta JSON del endpoint
        """
        _logger.info(f"Iniciando consulta del endpoint complejo: {endpoint_key}")
        
        success, data, error_msg = self._execute_query(endpoint_key)
        
        if success:
            response = self._build_complex_response(endpoint_key, data)
            self._set_response_headers()
            _logger.info(f"Consulta {endpoint_key} ejecutada exitosamente. Registros: {len(data) if data else 0}")
            return response
        else:
            # Respuesta de error manteniendo estructura compleja
            response = self._build_complex_response(endpoint_key, [])
            response["error"] = {
                "message": error_msg,
                "success": False
            }
            self._set_response_headers(error=True)
            return response

    def _process_data_for_visualization(self, data, endpoint_key):
        """
        Procesa los datos para optimizarlos para visualización.
        Las subclases pueden sobrescribir para procesamiento específico.
        
        Args:
            data (list): Datos originales de la consulta
            endpoint_key (str): Clave del endpoint
            
        Returns:
            list: Datos procesados
        """
        # Implementación base - las subclases pueden sobrescribir
        return data

    # Método de utilidad para convertir montos a millones (útil para budget)
    def _convert_to_millions(self, amount):
        """
        Convierte un monto a millones para visualización.
        
        Args:
            amount (int/float): Monto original
            
        Returns:
            float: Monto en millones
        """
        if amount is None:
            return 0
        return round(float(amount) / 1000000, 1)

    # Método de utilidad para formatear fechas
    def _format_date_for_response(self, date_obj):
        """
        Formatea una fecha para incluir en la respuesta JSON.
        
        Args:
            date_obj: Objeto fecha
            
        Returns:
            str: Fecha formateada
        """
        if date_obj is None:
            return ""
        
        if isinstance(date_obj, str):
            return date_obj
            
        return date_obj.strftime("%Y-%m-%d") if hasattr(date_obj, 'strftime') else str(date_obj)