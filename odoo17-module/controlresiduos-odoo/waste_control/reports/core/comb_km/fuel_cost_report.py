from odoo import models, api, _
from ...report_utils import (
    aggregate_by_month_and_group,
    build_rows_from_grid,
    get_report_date,
)


class FuelCostReport(models.AbstractModel):
    _name = "report.waste_control.fuel_cost_report"
    _description = "Reporte de costo de combustible"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.fuel_cost_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        # Aggregate amount from fuel purchase orders
        grid, vehicle_map, monthly_total, month_headers = aggregate_by_month_and_group(
            self.env,
            "waste_control.fuel_purchase_orders",
            year,
            "amount",
            "historic_vehicles_id",
            date_field="date",
        )

        rows = build_rows_from_grid(grid, vehicle_map, sort_by_name=True)

        grand_total = sum(monthly_total.values())
        monthly_average_total = grand_total / 12.0 if grand_total else 0.0

        # Calculate daily average (assuming 365 days)
        # Requirement: "promedio de gasto diario de combustible"
        daily_average_total = grand_total / 365.0 if grand_total else 0.0

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.fuel_purchase_orders",
            "selected_year": year,
            "month_headers": month_headers,
            "rows": rows,
            "monthly_average_total": monthly_average_total,
            "daily_average_total": daily_average_total,
            "company_currency": self.env.company.currency_id,
            "report_date": get_report_date(),
        }
