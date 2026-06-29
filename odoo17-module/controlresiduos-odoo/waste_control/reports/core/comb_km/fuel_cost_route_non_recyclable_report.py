from odoo import models, api, _
from calendar import month_name
from ...report_utils import (
    aggregate_by_month_and_group,
    get_report_date,
)


class FuelCostRouteNonRecyclableReport(models.AbstractModel):
    _name = "report.waste_control.fuel_cost_route_non_recyclable_report"
    _description = "Reporte de costo de combustible por ruta (no reciclable)"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.fuel_cost_route_non_recyclable_wizard"].browse(
            docids
        )
        wizard.ensure_one()
        year = wizard.year

        # Step 1: Calculate Cost Per Km for each Vehicle per Month
        # Fetch Total Use (Km) per Vehicle per Month
        km_grid, vehicle_map_km, _, _ = aggregate_by_month_and_group(
            self.env,
            "waste_control.kilometers_traveled",
            year,
            "total_km",
            "historic_vehicles_id",
            date_field="date",
        )

        # Fetch Total Fuel Cost per Vehicle per Month
        cost_grid, vehicle_map_cost, _, _ = aggregate_by_month_and_group(
            self.env,
            "waste_control.fuel_purchase_orders",
            year,
            "amount",
            "historic_vehicles_id",
            date_field="date",
        )

        # Calculate rates where possible
        cost_per_km_map = {}  # {vehicle_id: {month: rate}}
        all_vehicles = set(km_grid.keys()) | set(cost_grid.keys())

        for vid in all_vehicles:
            cost_per_km_map[vid] = {}
            for m in range(1, 13):
                km = km_grid.get(vid, {}).get(m, 0.0)
                cost = cost_grid.get(vid, {}).get(m, 0.0)

                if km > 0 and cost > 0:
                    cost_per_km_map[vid][m] = cost / km
                else:
                    cost_per_km_map[vid][m] = 0.0

        # Step 2: Fetch Km on  Routes, grouped by Route & Vehicle
        domain = [
            ("date", ">=", f"{year}-01-01"),
            ("date", "<=", f"{year}-12-31"),
            "|",
            ("types_of_waste_id.name", "ilike", "No aprovechable"),
            ("types_of_waste_id.name", "ilike", "Basura"),
        ]

        # Group by Month, Route, Vehicle
        alloc_data = self.env["waste_control.kilometers_traveled"].read_group(
            domain=domain,
            fields=["total_km:sum", "routes_id", "historic_vehicles_id", "month"],
            groupby=["month", "routes_id", "historic_vehicles_id"],
            lazy=False,
        )

        route_cost_grid = {}
        comercial_row = {x: 0.0 for x in range(1, 13)}

        def is_comercial(name):
            if not name:
                return False
            return "comercial" in name.lower()

        for group in alloc_data:
            month = int(group["month"]) if group.get("month") else 0
            if month not in range(1, 13):
                continue

            routes_id = group.get("routes_id")
            route_name = routes_id[1] if routes_id else "Unknown"

            vehicle_id = group.get("historic_vehicles_id")
            vid = vehicle_id[0] if vehicle_id else False

            km_on_route = group.get("total_km", 0.0) or 0.0

            # Apply Rate
            rate = 0.0
            if vid and vid in cost_per_km_map:
                rate = cost_per_km_map[vid].get(month, 0.0)

            allocated_cost = km_on_route * rate

            if allocated_cost == 0:
                continue

            if is_comercial(route_name):
                comercial_row[month] += allocated_cost
            else:
                if route_name not in route_cost_grid:
                    route_cost_grid[route_name] = {x: 0.0 for x in range(1, 13)}
                route_cost_grid[route_name][month] += allocated_cost

        # Step 3: Format Rows
        rows = []
        for r_name in sorted(route_cost_grid.keys()):
            vals = [route_cost_grid[r_name][m] for m in range(1, 13)]
            total = sum(vals)
            rows.append(
                {
                    "name": r_name,
                    "data": vals,
                    "total": total,
                    "monthly_average": total / 12.0,
                }
            )

        comercial_vals = [comercial_row[m] for m in range(1, 13)]
        if sum(comercial_vals) > 0:
            rows.append(
                {
                    "name": "COMERCIAL",
                    "data": comercial_vals,
                    "total": sum(comercial_vals),
                    "monthly_average": sum(comercial_vals) / 12.0,
                }
            )

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.fuel_cost_route_non_recyclable_wizard",
            "selected_year": year,
            "month_headers": [month_name[i] for i in range(1, 13)],
            "rows": rows,
            "company_currency": self.env.company.currency_id,
            "report_date": get_report_date(),
        }
