from odoo import models, api, _
from ...report_utils import (
    aggregate_by_month_and_group,
    build_rows_from_grid,
    get_report_date,
)


class FuelConsumptionByPlateReport(models.AbstractModel):
    _name = "report.waste_control.fuel_consumption_by_plate_report"
    _description = "Reporte de consumo de combustible por placa"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.fuel_consumption_by_plate_wizard"].browse(
            docids
        )
        wizard.ensure_one()

        year = wizard.year

        # Use utility for aggregation by month and vehicle
        grid, vehicle_map, monthly_total, month_headers = aggregate_by_month_and_group(
            self.env,
            "waste_control.fuel_purchase_orders",
            year,
            "liters",
            "historic_vehicles_id",
            date_field="date",
        )

        # Build rows using utility
        rows = build_rows_from_grid(grid, vehicle_map, sort_by_name=True)

        # Calculate monthly average total (grand total / 12)
        grand_total = sum(monthly_total.values())
        monthly_average_total = grand_total / 12.0 if grand_total else 0.0

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.fuel_purchase_orders",
            "selected_year": year,
            "month_headers": month_headers,
            "rows": rows,
            "monthly_average_total": monthly_average_total,
            "report_date": get_report_date(),
        }
