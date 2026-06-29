from odoo import models, api, _
from calendar import month_name
from ...report_utils import (
    aggregate_by_month_and_group,
    get_report_date,
)


class FuelEfficiencyReport(models.AbstractModel):
    _name = "report.waste_control.fuel_efficiency_report"
    _description = "Reporte de eficiencia de combustible"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.fuel_efficiency_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        # 1. Get Km Data
        grid_km, vehicle_map_km, _, _ = aggregate_by_month_and_group(
            self.env,
            "waste_control.kilometers_traveled",
            year,
            "total_km",
            "historic_vehicles_id",
            date_field="date",
        )

        # 2. Get Fuel Data (Liters)
        grid_liters, vehicle_map_liters, _, _ = aggregate_by_month_and_group(
            self.env,
            "waste_control.fuel_purchase_orders",
            year,
            "liters",
            "historic_vehicles_id",
            date_field="date",
        )

        # 3. Merge Vehicles
        all_vehicle_ids = set(vehicle_map_km.keys()) | set(vehicle_map_liters.keys())
        # Prefer names from one map, fallback to other
        vehicle_map = {}
        for vid in all_vehicle_ids:
            name = (
                vehicle_map_km.get(vid)
                or vehicle_map_liters.get(vid)
                or f"Vehicle {vid}"
            )
            vehicle_map[vid] = name

        # 4. Build Rows
        rows = []
        # Sort by vehicle name
        sorted_vids = sorted(all_vehicle_ids, key=lambda x: vehicle_map[x])

        for vid in sorted_vids:
            row_data = []
            total_km_year = 0.0
            total_liters_year = 0.0
            sum_of_monthly_efficiencies = 0.0
            count_months_with_efficiency = 0

            for month in range(1, 13):
                km = grid_km.get(vid, {}).get(month, 0.0)
                liters = grid_liters.get(vid, {}).get(month, 0.0)

                total_km_year += km
                total_liters_year += liters

                if liters > 0:
                    efficiency = km / liters
                    sum_of_monthly_efficiencies += efficiency
                    count_months_with_efficiency += 1
                else:
                    efficiency = 0.0

                row_data.append(efficiency)

            # Annual efficiency (total Km / total Liters)
            if total_liters_year > 0:
                annual_efficiency = total_km_year / total_liters_year
            else:
                annual_efficiency = 0.0

            # Monthly average efficiency (sum of efficiencies / 12) - as requested "promedio mensual"
            # note: arithmetic mean of ratios is different from ratio of sums.
            monthly_average = sum_of_monthly_efficiencies / 12.0

            rows.append(
                {
                    "name": vehicle_map[vid],
                    "data": row_data,
                    "total_annual": annual_efficiency,
                    "monthly_average": monthly_average,
                }
            )

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.fuel_efficiency_wizard",
            "selected_year": year,
            "month_headers": [month_name[i] for i in range(1, 13)],
            "rows": rows,
            "report_date": get_report_date(),
        }
