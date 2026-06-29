import logging
from datetime import datetime
from odoo import http
from odoo.http import request
from .base_analytics_controller import BaseAnalyticsController

_logger = logging.getLogger(__name__)


class BudgetController(BaseAnalyticsController):
    """
    Controller unificado para todos los endpoints de análisis presupuestario municipal.
    Maneja 6 endpoints diferentes con estructuras de datos complejas, múltiples visualizaciones,
    insights automáticos, metadata detallada y exportación CSV.
    """

    @property
    def _GLOBAL_CONFIG(self):
        """Configuración global para todos los endpoints de budget."""
        return {
            "cache_control": "public, max-age=3600",  # Cache de 1 hora para datos presupuestarios
            "content_type": "application/json"
        }

    @property
    def _SQL_DIRECTORY(self):
        """Directorio donde están los archivos SQL de budget."""
        return "website/budget"

    @property
    def _ENDPOINTS_CONFIG(self):
        """Configuración específica para cada endpoint de budget."""
        return {
        "budget-goals": {
            "title": "Metas del Presupuesto Municipal",
            "description": "Distribución del presupuesto municipal por tipo de meta o área de inversión",
            "sql_file": "budget_goals.sql",
            "csv_config": {
                "filename": "metas_presupuesto_municipal.csv",
                "headers": ["Tipo de Meta", "Monto", "Porcentaje (%)"],
                "data_keys": ["goalType", "amount", "percentage"]
            },
            "views": [
                {
                    "type": "pie",
                    "config": {
                        "title": "Distribución por Tipo de Meta",
                        "dataKey": "amount",
                        "nameKey": "goalType",
                        "showPercentage": True
                    }
                },
                {
                    "type": "bar",
                    "config": {
                        "title": "Monto por Tipo de Meta (en millones ₡)",
                        "xAxisKey": "goalType",
                        "yAxisKey": "amountInMillions",
                        "color": "#3b82f6"
                    }
                },
                {
                    "type": "table",
                    "config": {
                        "title": "Detalle de Metas Presupuestarias",
                        "columns": ["goalType", "amount", "percentage"],
                        "columnTitles": {
                            "goalType": "Tipo de Meta",
                            "amount": "Monto",
                            "percentage": "Porcentaje (%)"
                        }
                    }
                }
            ]
        },
        "budget-history": {
            "title": "Evolución del Presupuesto Municipal",
            "description": "Monto total del presupuesto municipal en los últimos 5 años con análisis de crecimiento",
            "sql_file": "budget_history.sql",
            "csv_config": {
                "filename": "evolucion_presupuesto_municipal.csv",
                "headers": ["Año", "Monto Total", "Variación", "Tasa de Crecimiento (%)"],
                "data_keys": ["year", "amount", "variation", "growthrate"]
            },
            "views": [
                {
                    "type": "line",
                    "config": {
                        "title": "Evolución del Presupuesto Municipal (millones ₡)",
                        "xAxisKey": "year",
                        "yAxisKey": "amountInMillions",
                        "color": "#3b82f6"
                    }
                },
                {
                    "type": "bar",
                    "config": {
                        "title": "Tasa de Crecimiento Anual (%)",
                        "xAxisKey": "year",
                        "yAxisKey": "growthrate",
                        "color": "#10b981"
                    }
                },
                {
                    "type": "bar",
                    "config": {
                        "title": "Variación Anual del Presupuesto (millones ₡)",
                        "xAxisKey": "year",
                        "yAxisKey": "variationInMillions",
                        "color": "#f59e0b"
                    }
                },
                {
                    "type": "table",
                    "config": {
                        "title": "Detalle Histórico del Presupuesto",
                        "columns": ["year", "amount", "variation", "growthrate"],
                        "columnTitles": {
                            "year": "Año",
                            "amount": "Monto Total",
                            "variation": "Variación",
                            "growthrate": "Tasa de Crecimiento (%)"
                        }
                    }
                }
            ]
        },
        "budget-income": {
            "title": "Ingresos del Presupuesto Municipal",
            "description": "Análisis de las diferentes fuentes de ingresos que financian el presupuesto municipal",
            "sql_file": "budget_income.sql",
            "csv_config": {
                "filename": "ingresos_presupuesto_municipal.csv",
                "headers": ["Fuente de Ingreso", "Monto", "Porcentaje (%)", "Tipo"],
                "data_keys": ["incomeSource", "amount", "percentage", "incomeType"]
            },
            "views": [
                {
                    "type": "pie",
                    "config": {
                        "title": "Distribución de Ingresos por Fuente",
                        "dataKey": "amount",
                        "nameKey": "incomeSource",
                        "showPercentage": True
                    }
                },
                {
                    "type": "bar",
                    "config": {
                        "title": "Monto por Fuente de Ingreso (millones ₡)",
                        "xAxisKey": "incomeSource",
                        "yAxisKey": "amountInMillions",
                        "color": "#10b981"
                    }
                },
                {
                    "type": "bar",
                    "config": {
                        "title": "Ingresos por Tipo de Fuente",
                        "xAxisKey": "incomeType",
                        "yAxisKey": "totalAmount",
                        "color": "#8b5cf6"
                    }
                },
                {
                    "type": "table",
                    "config": {
                        "title": "Detalle de Fuentes de Ingreso",
                        "columns": ["incomeSource", "amount", "percentage", "incomeType"],
                        "columnTitles": {
                            "incomeSource": "Fuente de Ingreso",
                            "amount": "Monto",
                            "percentage": "Porcentaje (%)",
                            "incomeType": "Tipo"
                        }
                    }
                }
            ]
        },
        "budget-areas": {
            "title": "Presupuesto por Áreas Municipales",
            "description": "Distribución del presupuesto municipal por departamentos y áreas administrativas",
            "sql_file": "budget_areas.sql",
            "csv_config": {
                "filename": "presupuesto_areas_municipales.csv",
                "headers": ["Área", "Presupuesto", "Porcentaje (%)", "Departamento"],
                "data_keys": ["area", "budget", "percentage", "department"]
            },
            "views": [
                {
                    "type": "pie",
                    "config": {
                        "title": "Distribución por Área Municipal",
                        "dataKey": "budget",
                        "nameKey": "area",
                        "showPercentage": True
                    }
                },
                {
                    "type": "bar",
                    "config": {
                        "title": "Presupuesto por Área (millones ₡)",
                        "xAxisKey": "area",
                        "yAxisKey": "budgetInMillions",
                        "color": "#ef4444"
                    }
                },
                {
                    "type": "bar",
                    "config": {
                        "title": "Presupuesto por Departamento",
                        "xAxisKey": "department",
                        "yAxisKey": "totalBudget",
                        "color": "#f59e0b"
                    }
                },
                {
                    "type": "table",
                    "config": {
                        "title": "Detalle Presupuestario por Área",
                        "columns": ["area", "budget", "percentage", "department"],
                        "columnTitles": {
                            "area": "Área",
                            "budget": "Presupuesto",
                            "percentage": "Porcentaje (%)",
                            "department": "Departamento"
                        }
                    }
                }
            ]
        },
        "budget-percentages": {
            "title": "Montos Semestrales del Presupuesto por Objetivos",
            "description": "Distribución de montos presupuestarios por objetivos municipales entre primer y segundo semestre",
            "sql_file": "budget_percentages.sql",
            "csv_config": {
                "filename": "montos_semestrales_objetivos.csv",
                "headers": ["Objetivo Municipal", "Primer Semestre", "Segundo Semestre", "Total Anual", "% del Presupuesto"],
                "data_keys": ["objetivo", "primerSemestre", "segundoSemestre", "total", "porcentajeTotal"]
            },
            "views": [
                {
                    "type": "bar",
                    "config": {
                        "title": "Montos del Presupuesto por Objetivos y Semestre",
                        "xAxisKey": "objetivo",
                        "yAxisKeys": ["primerSemestreInMillions", "segundoSemestreInMillions"],
                        "colors": ["#87CEEB", "#4169E1"],
                        "labels": ["Primer Semestre", "Segundo Semestre"],
                        "stacked": True
                    }
                },
                {
                    "type": "table",
                    "config": {
                        "title": "Detalle de Montos por Objetivos",
                        "columns": ["objetivo", "primerSemestre", "segundoSemestre", "total", "porcentajeTotal"],
                        "columnTitles": {
                            "objetivo": "Objetivo Municipal",
                            "primerSemestre": "Primer Semestre",
                            "segundoSemestre": "Segundo Semestre",
                            "total": "Total Anual",
                            "porcentajeTotal": "% del Presupuesto"
                        }
                    }
                }
            ]
        },
        "budget-mosaic": {
            "title": "Objetivos por Área del Presupuesto Ordinario",
            "description": "Distribución de objetivos municipales por área con sus respectivos montos del presupuesto ordinario",
            "sql_file": "budget_mosaic.sql",
            "csv_config": {
                "filename": "mosaico_presupuesto_objetivos.csv",
                "headers": ["Área", "Objetivo", "Objetivo Completo", "Monto", "Porcentaje (%)", "Color"],
                "data_keys": ["area", "objetivo", "objetivoCompleto", "monto", "porcentaje", "color"]
            },
            "views": [
                {
                    "type": "mosaic",
                    "config": {
                        "title": "Mosaico de Objetivos por Área",
                        "valueKey": "monto",
                        "labelKey": "objetivo",
                        "areaKey": "area",
                        "colorKey": "color",
                        "dataFilter": "detailed"
                    }
                },
                {
                    "type": "table",
                    "config": {
                        "title": "Detalle de Objetivos por Área",
                        "columns": ["area", "objetivo", "monto", "porcentaje"],
                        "columnTitles": {
                            "area": "Área",
                            "objetivo": "Objetivo",
                            "monto": "Monto Presupuesto Ordinario",
                            "porcentaje": "% del Total"
                        },
                        "dataFilter": "detailed"
                    }
                }
            ]
        }
    }

    def _format_currency(self, amount):
        """Formatear montos en colones costarricenses."""
        if amount is None:
            return "₡0"
        return f"₡{amount:,.0f}".replace(',', '.')

    def _calculate_millions(self, amount):
        """Convertir montos a millones para visualización."""
        if amount is None or amount == 0:
            return 0
        return round(amount / 1000000, 1)

    def _generate_csv_data(self, endpoint_key, data):
        """
        Genera los datos CSV para exportación basados en la configuración del endpoint.
        
        Args:
            endpoint_key (str): Clave del endpoint
            data: Datos de la consulta (list o dict para mosaic)
            
        Returns:
            dict: Configuración CSV con filename, headers y data formateada
        """
        config = self._ENDPOINTS_CONFIG.get(endpoint_key, {})
        csv_config = config.get("csv_config", {})
        
        if not data:
            return {
                "filename": csv_config.get("filename", "presupuesto_municipal.csv"),
                "headers": csv_config.get("headers", []),
                "data": []
            }
        
        # Para budget-mosaic ya no hay manejo especial porque ahora es una lista normal
        
        # Para endpoints normales con lista de datos
        if not isinstance(data, list):
            return {
                "filename": csv_config.get("filename", "presupuesto_municipal.csv"),
                "headers": csv_config.get("headers", []),
                "data": []
            }
        
        csv_data = []
        data_keys = csv_config.get("data_keys", [])
        
        for item in data:
            row = []
            for key in data_keys:
                value = item.get(key, "")
                # Formatear montos y porcentajes para CSV
                if "amount" in key.lower() or "budget" in key.lower():
                    value = self._format_currency(value) if isinstance(value, (int, float)) else str(value)
                elif "percentage" in key.lower() or "rate" in key.lower():
                    value = f"{value}" if isinstance(value, (int, float)) else str(value)
                else:
                    value = str(value)
                row.append(value)
            csv_data.append(row)
        
        return {
            "filename": csv_config.get("filename", "presupuesto_municipal.csv"),
            "headers": csv_config.get("headers", []),
            "data": csv_data
        }

    def _build_complex_response(self, endpoint_key, data):
        """
        Construye la respuesta JSON para endpoints de budget con funcionalidad completa.
        Sobrescribe el método base para agregar funcionalidad específica de budget.
        
        Args:
            endpoint_key (str): Clave del endpoint en _ENDPOINTS_CONFIG
            data: Datos obtenidos de la consulta SQL (list o dict para mosaic)
            
        Returns:
            dict: Respuesta JSON en formato de budget
        """
        config = self._ENDPOINTS_CONFIG.get(endpoint_key, {})
        
        # Preparar datos procesados (agregar campos calculados)
        processed_data = self._process_data_for_visualization(data, endpoint_key)
        
        # Construir respuesta base
        response = {
            "title": config.get("title", "Análisis Presupuestario"),
            "description": config.get("description", "Datos presupuestarios municipales"),
            "views": config.get("views", []),
            "data": processed_data
        }
        
        # Generar datos CSV específicos de budget
        response["csv"] = self._generate_csv_data(endpoint_key, data)
        
        # Generar insights automáticos basados en datos de budget
        response["insights"] = self._generate_insights(endpoint_key, data)
        
        # Generar metadata específica para budget
        response["metadata"] = self._generate_metadata(endpoint_key, data)
        
        return response

    def _process_data_for_visualization(self, data, endpoint_key):
        """
        Procesa los datos para agregar campos calculados necesarios para visualización.
        Sobrescribe el método base para agregar lógica específica de budget.
        
        Args:
            data: Datos originales de la consulta
            endpoint_key (str): Clave del endpoint
            
        Returns:
            Datos procesados con campos adicionales
        """
        if not data:
            return []
        
        # Para endpoints normales, agregar campos calculados
        if not isinstance(data, list):
            return []
        
        processed_data = []
        for item in data:
            processed_item = item.copy()
            
            # Agregar campos de montos en millones para visualización
            if "amount" in item:
                processed_item["amountInMillions"] = self._calculate_millions(item["amount"])
            if "budget" in item:
                processed_item["budgetInMillions"] = self._calculate_millions(item["budget"])
            if "budgeted" in item:
                processed_item["budgetedInMillions"] = self._calculate_millions(item["budgeted"])
            if "executed" in item:
                processed_item["executedInMillions"] = self._calculate_millions(item["executed"])
            if "variation" in item:
                processed_item["variationInMillions"] = self._calculate_millions(item["variation"])
            
            # Para budget-mosaic, agregar campo de montos en millones
            if endpoint_key == "budget-mosaic" and "monto" in item:
                processed_item["montoInMillions"] = self._calculate_millions(item["monto"])
            
            # Para budget-percentages, agregar campos de semestres en millones
            if endpoint_key == "budget-percentages":
                if "primerSemestre" in item:
                    processed_item["primerSemestreInMillions"] = self._calculate_millions(item["primerSemestre"])
                if "segundoSemestre" in item:
                    processed_item["segundoSemestreInMillions"] = self._calculate_millions(item["segundoSemestre"])
                if "total" in item:
                    processed_item["totalInMillions"] = self._calculate_millions(item["total"])
            
            processed_data.append(processed_item)
        
        return processed_data

    def _generate_insights(self, endpoint_key, data):
        """
        Genera insights automáticos basados en los datos de cada endpoint presupuestario.
        
        Args:
            endpoint_key (str): Clave del endpoint
            data: Datos de la consulta
            
        Returns:
            list: Lista de insights como strings
        """
        if not data:
            return ["No hay datos presupuestarios disponibles para generar insights"]
        
        insights = []
        
        try:
            if endpoint_key == "budget-goals":
                if isinstance(data, list) and data:
                    total_budget = sum(item.get('amount', 0) for item in data)
                    largest_goal = max(data, key=lambda x: x.get('amount', 0))
                    insights.append(f"El presupuesto total asignado es de {self._format_currency(total_budget)}")
                    insights.append(f"La meta con mayor asignación es '{largest_goal.get('goalType', 'N/A')}' con {largest_goal.get('percentage', 0):.1f}% del presupuesto total")
                    
            elif endpoint_key == "budget-history":
                if isinstance(data, list) and len(data) >= 2:
                    current_year = max(data, key=lambda x: int(x.get('year', '0')))
                    prev_year = max([x for x in data if x.get('year') != current_year.get('year')], 
                                   key=lambda x: int(x.get('year', '0')), default={})
                    
                    if prev_year:
                        growth = current_year.get('growthRate', 0)
                        insights.append(f"El presupuesto actual es de {self._format_currency(current_year.get('amount', 0))}")
                        insights.append(f"Crecimiento del {growth:.1f}% respecto al año anterior")
                    
            elif endpoint_key == "budget-income":
                if isinstance(data, list) and data:
                    total_income = sum(item.get('amount', 0) for item in data)
                    main_source = max(data, key=lambda x: x.get('amount', 0))
                    insights.append(f"Los ingresos totales proyectados son de {self._format_currency(total_income)}")
                    insights.append(f"La principal fuente de ingresos es '{main_source.get('incomeSource', 'N/A')}' con {main_source.get('percentage', 0):.1f}%")
                    
            elif endpoint_key == "budget-areas":
                if isinstance(data, list) and data:
                    total_budget = sum(item.get('budget', 0) for item in data)
                    largest_area = max(data, key=lambda x: x.get('budget', 0))
                    insights.append(f"Presupuesto total distribuido: {self._format_currency(total_budget)}")
                    insights.append(f"El área con mayor presupuesto es '{largest_area.get('area', 'N/A')}' con {largest_area.get('percentage', 0):.1f}%")
                    
            elif endpoint_key == "budget-percentages":
                if isinstance(data, list) and data:
                    total_primer_semestre = sum(item.get('primerSemestre', 0) for item in data)
                    total_segundo_semestre = sum(item.get('segundoSemestre', 0) for item in data)
                    largest_objective = max(data, key=lambda x: x.get('total', 0))
                    
                    # Comparar diferencia entre semestres
                    diferencia_semestres = total_segundo_semestre - total_primer_semestre
                    porcentaje_diferencia = (diferencia_semestres / total_primer_semestre * 100) if total_primer_semestre > 0 else 0
                    
                    insights.append(f"Presupuesto total del primer semestre: {self._format_currency(total_primer_semestre)}")
                    insights.append(f"Presupuesto total del segundo semestre: {self._format_currency(total_segundo_semestre)}")
                    insights.append(f"El objetivo con mayor presupuesto total es '{largest_objective.get('objetivo', 'N/A')}' con {largest_objective.get('porcentajeTotal', 0):.1f}%")
                    
                    if porcentaje_diferencia > 5:
                        insights.append(f"El segundo semestre tiene {porcentaje_diferencia:.1f}% más presupuesto que el primero")
                    elif porcentaje_diferencia < -5:
                        insights.append(f"El primer semestre tiene {abs(porcentaje_diferencia):.1f}% más presupuesto que el segundo")
                    else:
                        insights.append("La distribución entre semestres es equilibrada")
                    
            elif endpoint_key == "budget-mosaic":
                if isinstance(data, list) and data:
                    total_budget = sum(item.get('monto', 0) for item in data)
                    largest_objective = max(data, key=lambda x: x.get('monto', 0))
                    area_counts = {}
                    for item in data:
                        area = item.get('area', 'N/A')
                        area_counts[area] = area_counts.get(area, 0) + 1
                    
                    most_active_area = max(area_counts.items(), key=lambda x: x[1]) if area_counts else ('N/A', 0)
                    
                    insights.append(f"Presupuesto municipal total distribuido: {self._format_currency(total_budget)}")
                    insights.append(f"El objetivo con mayor presupuesto es '{largest_objective.get('objetivo', 'N/A')}' con {largest_objective.get('porcentaje', 0):.1f}%")
                    insights.append(f"El área con más objetivos presupuestarios es '{most_active_area[0]}' con {most_active_area[1]} objetivos")
        
        except Exception as e:
            _logger.warning(f"Error generando insights para {endpoint_key}: {str(e)}")
            insights = ["Insights presupuestarios en proceso de cálculo"]
        
        return insights

    def _generate_metadata(self, endpoint_key, data):
        """
        Genera metadata específica para cada endpoint presupuestario.
        
        Args:
            endpoint_key (str): Clave del endpoint
            data: Datos de la consulta
            
        Returns:
            dict: Metadata del endpoint
        """
        base_metadata = {
            "lastUpdated": datetime.now().isoformat(),
            "source": "Sistema Municipal de Gestión Presupuestaria",
            "currency": "CRC"
        }
        
        try:
            if endpoint_key == "budget-goals":
                if isinstance(data, list) and data:
                    total_budget = sum(item.get('amount', 0) for item in data)
                    most_funded = max(data, key=lambda x: x.get('amount', 0))
                    least_funded = min(data, key=lambda x: x.get('amount', 0))
                    
                    base_metadata.update({
                        "period": "Presupuesto 2024",
                        "totalBudget": total_budget,
                        "mostFundedArea": most_funded.get('goalType', 'N/A'),
                        "leastFundedArea": least_funded.get('goalType', 'N/A')
                    })
                    
            elif endpoint_key == "budget-history":
                if isinstance(data, list) and data:
                    years = [item.get('year', '') for item in data]
                    if years:
                        base_year = min(years)
                        current_year = max(years)
                        
                        base_year_data = next((x for x in data if x.get('year') == base_year), {})
                        current_year_data = next((x for x in data if x.get('year') == current_year), {})
                        
                        if base_year_data and current_year_data:
                            total_growth = ((current_year_data.get('amount', 0) - base_year_data.get('amount', 0)) 
                                           / base_year_data.get('amount', 1)) * 100
                        
                        avg_growth = sum(item.get('growthRate', 0) for item in data if item.get('growthRate') is not None) / len([x for x in data if x.get('growthRate') is not None]) if data else 0
                        
                        base_metadata.update({
                            "period": f"{base_year} - {current_year}",
                            "baseYear": base_year,
                            "currentYear": current_year,
                            "totalGrowthFromBase": f"{total_growth:.1f}%",
                            "averageGrowthRate": f"{avg_growth:.1f}%"
                        })
                        
            elif endpoint_key == "budget-income":
                if isinstance(data, list) and data:
                    total_income = sum(item.get('amount', 0) for item in data)
                    main_source = max(data, key=lambda x: x.get('amount', 0))
                    
                    # Calcular dependencia de transferencias
                    transfers = [x for x in data if 'transferencia' in x.get('incomeType', '').lower()]
                    transfer_dependency = (sum(x.get('amount', 0) for x in transfers) / total_income * 100) if transfers and total_income > 0 else 0
                    
                    base_metadata.update({
                        "period": "Presupuesto 2024",
                        "totalIncome": total_income,
                        "mainIncomeSource": main_source.get('incomeSource', 'N/A'),
                        "dependencyOnTransfers": f"{transfer_dependency:.1f}%"
                    })
                    
            elif endpoint_key == "budget-areas":
                if isinstance(data, list) and data:
                    total_budget = sum(item.get('budget', 0) for item in data)
                    largest_area = max(data, key=lambda x: x.get('budget', 0))
                    smallest_area = min(data, key=lambda x: x.get('budget', 0))
                    
                    base_metadata.update({
                        "period": "Presupuesto 2024",
                        "totalBudget": total_budget,
                        "largestArea": largest_area.get('area', 'N/A'),
                        "smallestArea": smallest_area.get('area', 'N/A'),
                        "numberOfAreas": len(data)
                    })
                    
            elif endpoint_key == "budget-percentages":
                if isinstance(data, list) and data:
                    total_primer_semestre = sum(item.get('primerSemestre', 0) for item in data)
                    total_segundo_semestre = sum(item.get('segundoSemestre', 0) for item in data)
                    total_anual = sum(item.get('total', 0) for item in data)
                    
                    largest_objective = max(data, key=lambda x: x.get('total', 0))
                    smallest_objective = min(data, key=lambda x: x.get('total', 0))
                    
                    # Calcular distribución semestral
                    porcentaje_primer_semestre = (total_primer_semestre / total_anual * 100) if total_anual > 0 else 0
                    porcentaje_segundo_semestre = (total_segundo_semestre / total_anual * 100) if total_anual > 0 else 0
                    
                    base_metadata.update({
                        "period": "Distribución Semestral 2024",
                        "totalFirstSemester": total_primer_semestre,
                        "totalSecondSemester": total_segundo_semestre,
                        "totalAnnualBudget": total_anual,
                        "firstSemesterPercentage": f"{porcentaje_primer_semestre:.1f}%",
                        "secondSemesterPercentage": f"{porcentaje_segundo_semestre:.1f}%",
                        "largestObjective": largest_objective.get('objetivo', 'N/A'),
                        "smallestObjective": smallest_objective.get('objetivo', 'N/A'),
                        "numberOfObjectives": len(data)
                    })
                    
            elif endpoint_key == "budget-mosaic":
                if isinstance(data, list) and data:
                    total_budget = sum(item.get('monto', 0) for item in data)
                    largest_objective = max(data, key=lambda x: x.get('monto', 0))
                    smallest_objective = min(data, key=lambda x: x.get('monto', 0))
                    unique_areas = len(set(item.get('area', '') for item in data))
                    
                    base_metadata.update({
                        "period": "Mosaico Presupuestario 2024",
                        "totalBudget": total_budget,
                        "numberOfObjectives": len(data),
                        "numberOfAreas": unique_areas,
                        "largestObjective": largest_objective.get('objetivo', 'N/A'),
                        "smallestObjective": smallest_objective.get('objetivo', 'N/A')
                    })
        
        except Exception as e:
            _logger.warning(f"Error generando metadata para {endpoint_key}: {str(e)}")
        
        return base_metadata


    def _execute_query(self, endpoint_key):
        """
        Ejecuta la consulta SQL para un endpoint específico de budget.
        Sobrescribe el método base para agregar procesamiento especial de budget-mosaic.
        
        Args:
            endpoint_key (str): Clave del endpoint en _ENDPOINTS_CONFIG
            
        Returns:
            tuple: (success: bool, result: list/dict, error_message: str)
        """
        try:
            config = self._ENDPOINTS_CONFIG.get(endpoint_key, {})
            sql_file = config.get("sql_file")
            
            if not sql_file:
                return False, [], f"Configuración SQL no encontrada para endpoint: {endpoint_key}"
            
            # Construir ruta completa del archivo SQL
            sql_path = f"{self._SQL_DIRECTORY}/{sql_file}"
            
            # Ejecutar consulta SQL usando el conector Oracle
            raw_result = request.env["yaipan_reports.oracle"].ejecutar_query_oracle(
                sql_path, {}
            )
            
            # Para budget-mosaic, no procesar - la consulta ya genera los datos correctos
            return True, raw_result, None
            
        except Exception as e:
            error_msg = f"Error al ejecutar consulta {endpoint_key}: {str(e)}"
            _logger.error(error_msg)
            return False, [], error_msg


    # === ENDPOINTS DE BUDGET ===

    @http.route("/api/v1/yaipan_reports/budget/budget-goals", type='json', auth='user', methods=['POST'], csrf=False)
    def get_budget_goals(self, **kwargs):
        """Endpoint para obtener la distribución del presupuesto municipal por tipo de meta."""
        return self._handle_complex_endpoint("budget-goals")

    @http.route("/api/v1/yaipan_reports/budget/budget-history", type='json', auth='user', methods=['POST'], csrf=False)
    def get_budget_history(self, **kwargs):
        """Endpoint para obtener la evolución histórica del presupuesto municipal."""
        return self._handle_complex_endpoint("budget-history")

    @http.route("/api/v1/yaipan_reports/budget/budget-income", type='json', auth='user', methods=['POST'], csrf=False)
    def get_budget_income(self, **kwargs):
        """Endpoint para obtener las fuentes de ingresos del presupuesto municipal."""
        return self._handle_complex_endpoint("budget-income")

    @http.route("/api/v1/yaipan_reports/budget/budget-areas", type='json', auth='user', methods=['POST'], csrf=False)
    def get_budget_areas(self, **kwargs):
        """Endpoint para obtener la distribución del presupuesto por áreas municipales."""
        return self._handle_complex_endpoint("budget-areas")

    @http.route("/api/v1/yaipan_reports/budget/budget-percentages", type='json', auth='user', methods=['POST'], csrf=False)
    def get_budget_percentages(self, **kwargs):
        """Endpoint para obtener los porcentajes de ejecución presupuestaria."""
        return self._handle_complex_endpoint("budget-percentages")

    @http.route("/api/v1/yaipan_reports/budget/budget-mosaic", type='json', auth='user', methods=['POST'], csrf=False)
    def get_budget_mosaic(self, **kwargs):
        """Endpoint para obtener el dashboard presupuestario municipal."""
        return self._handle_complex_endpoint("budget-mosaic")
 