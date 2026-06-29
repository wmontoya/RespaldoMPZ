"""
Utilidades comunes para reportes del módulo waste_control.
Centraliza lógica reutilizable para evitar duplicación de código.
"""

from calendar import month_name
from datetime import datetime


def aggregate_by_month(
    env, model, year, fields, groupby="month", domain_extra=None, date_field="year"
):
    """
    Agrega datos por mes para un modelo dado.

    Args:
        env: Environment de Odoo
        model: Nombre del modelo a consultar (ej: "waste_control.fuel_purchase_orders")
        year: Año a filtrar
        fields: Lista de campos a sumar (ej: ["liters", "amount"])
        groupby: Campo por el cual agrupar (default: "month")
        domain_extra: Lista de dominios adicionales a agregar
        date_field: Campo de fecha/año a usar para filtrar ("year" o "date")

    Returns:
        Tupla con (month_data, annual_total, month_names)
        - month_data: dict {mes: {campo: valor}} para meses 1-12
        - annual_total: dict {campo: valor_anual}
        - month_names: lista de nombres de meses
    """
    # Construir dominio según el tipo de campo
    if date_field == "date":
        domain = [("date", ">=", f"{year}-01-01"), ("date", "<=", f"{year}-12-31")]
    else:
        domain = [("year", "=", year)]

    if domain_extra:
        domain.extend(domain_extra)

    # Preparar fields con agregación sum
    fields_with_sum = [f"{f}:sum" for f in fields]

    grouped_data = env[model].read_group(
        domain=domain,
        fields=fields_with_sum,
        groupby=[groupby],
        lazy=False,
    )

    # Inicializar estructuras de datos
    month_data = {v_month: {field: 0.0 for field in fields} for v_month in range(1, 13)}
    annual_total = {field: 0.0 for field in fields}

    # Procesar datos agrupados
    for group in grouped_data:
        v_month = int(group[groupby]) if group.get(groupby) else None
        if v_month and v_month in month_data:
            for field in fields:
                value = group.get(field, 0.0) or 0.0
                month_data[v_month][field] += value
                annual_total[field] += value

    month_names = [month_name[v_month] for v_month in range(1, 13)]

    return month_data, annual_total, month_names


def aggregate_by_month_and_group(
    env,
    model,
    year,
    sum_field,
    group_field,
    groupby="month",
    domain_extra=None,
    date_field="year",
):
    """
    Agrega datos por mes y por un campo adicional (como rutas, distritos, etc.).

    Args:
        env: Environment de Odoo
        model: Nombre del modelo a consultar
        year: Año a filtrar
        sum_field: Campo a sumar
        group_field: Campo adicional por el cual agrupar (ej: "routes_id")
        groupby: Campo temporal por el cual agrupar (default: "month")
        domain_extra: Lista de dominios adicionales
        date_field: Campo de fecha/año a usar para filtrar ("year" o "date")

    Returns:
        Tupla con (grid, group_names, monthly_total, month_names)
        - grid: dict {group_id: {mes: valor}}
        - group_names: dict {group_id: nombre}
        - monthly_total: dict {mes: total}
        - month_names: lista de nombres de meses
    """
    # Construir dominio según el tipo de campo
    if date_field == "date":
        domain = [("date", ">=", f"{year}-01-01"), ("date", "<=", f"{year}-12-31")]
    else:
        domain = [("year", "=", year)]

    if domain_extra:
        domain.extend(domain_extra)

    grouped_data = env[model].read_group(
        domain=domain,
        fields=[f"{sum_field}:sum", group_field],
        groupby=[groupby, group_field],
        lazy=False,
    )

    grid = {}
    group_names = {}
    monthly_total = {v_month: 0.0 for v_month in range(1, 13)}

    for group in grouped_data:
        v_month = int(group[groupby]) if group.get(groupby) else None

        if group.get(group_field):
            g_id = group[group_field][0]
            g_name = group[group_field][1]
        else:
            g_id = False
            g_name = "Indefinido"

        value = group.get(sum_field, 0.0) or 0.0

        if v_month and v_month in range(1, 13):
            if g_id:
                if g_id not in grid:
                    grid[g_id] = {x: 0.0 for x in range(1, 13)}
                    group_names[g_id] = g_name
                grid[g_id][v_month] += value

            monthly_total[v_month] += value

    month_names = [month_name[v_month] for v_month in range(1, 13)]

    return grid, group_names, monthly_total, month_names


def build_rows_from_grid(grid, group_names, sort_by_name=True):
    """
    Construye filas de reporte desde un grid de datos.

    Args:
        grid: dict {group_id: {mes: valor}}
        group_names: dict {group_id: nombre}
        sort_by_name: Si True, ordena filas por nombre

    Returns:
        Lista de dicts con estructura {name, values, total, is_bold}
    """
    rows = []

    for g_id, vals_map in grid.items():
        vals = [vals_map[v_month] for v_month in range(1, 13)]
        rows.append(
            {
                "name": group_names[g_id],
                "values": vals,
                "total": sum(vals),
                "is_bold": False,
            }
        )

    if sort_by_name:
        rows.sort(key=lambda x: x["name"])

    return rows


def get_report_date():
    """Retorna la fecha actual formateada para reportes."""
    return datetime.now().strftime("%Y-%m-%d %H:%M")


def get_month_values_list(month_data, field):
    """
    Obtiene lista de valores para un campo específico ordenados por mes.

    Args:
        month_data: dict {mes: {campo: valor}}
        field: nombre del campo

    Returns:
        Lista de 12 valores (uno por mes)
    """
    return [month_data[v_month][field] for v_month in range(1, 13)]
