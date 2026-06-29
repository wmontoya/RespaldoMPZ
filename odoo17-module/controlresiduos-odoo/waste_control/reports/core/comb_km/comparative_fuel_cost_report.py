from odoo import models, api, _
from odoo.exceptions import UserError
from calendar import month_name
from ...report_utils import get_report_date


class ComparativeFuelCostReport(models.AbstractModel):
    _name = "report.waste_control.comparative_fuel_cost_report"
    _description = "Reporte comparativo de costos de combustible"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.comparative_fuel_cost_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"

        # 1. Get Annual Totals
        # Fetch all fuel orders for the year to get Total Cost
        fuel_orders = self.env["waste_control.fuel_purchase_orders"].search(
            [("date", ">=", start_date), ("date", "<=", end_date)]
        )
        total_annual_cost = sum(order.amount for order in fuel_orders)

        # Fetch all Km traveled for the year to get Total Km
        km_records = self.env["waste_control.kilometers_traveled"].search(
            [("date", ">=", start_date), ("date", "<=", end_date)]
        )
        total_annual_km = sum(rec.total_km for rec in km_records)

        # Calculate Global Cost per Km
        global_cost_per_km = 0
        if total_annual_km > 0:
            global_cost_per_km = total_annual_cost / total_annual_km

        # 2. Monthly Calculation
        months_data = []

        # Use read_group for efficiency
        fuel_data = self.env["waste_control.fuel_purchase_orders"].read_group(
            [("date", ">=", start_date), ("date", "<=", end_date)],
            ["amount", "date"],
            ["date:month"],
        )
        km_data = self.env["waste_control.kilometers_traveled"].read_group(
            [("date", ">=", start_date), ("date", "<=", end_date)],
            ["total_km", "date"],
            ["date:month"],
        )

        # Helper to map month string (e.g., 'August 2023') to index

        fuel_by_month = {m["date:month"]: m["amount"] for m in fuel_data}
        km_by_month = {m["date:month"]: m["total_km"] for m in km_data}

        # Need to match Odoo's read_group month format which depends on locale,
        # but usually "Month year".
        # A safer way might be to iterate 1..12 and filter, but read_group is better.
        # Let's try to map based on the month index if possible, or iterate ranges.

        # Iterating ranges is safer and cleaner for code logic given locale uncertainty
        for i in range(1, 13):
            # m_start = f"{year}-{i:02d}-01"

            m_fuel = sum(o.amount for o in fuel_orders if o.date.month == i)
            m_km = sum(k.total_km for k in km_records if k.date.month == i)

            expected_cost = m_km * global_cost_per_km
            difference = (
                expected_cost - m_fuel
            )  # Expected vs Real. If +ve, saved money. If -ve, overspent.

            # Usually "Comparative" means Real vs Budget.
            # If Real (m_fuel) > Expected, Difference is negative (bad).
            # Let's define Diff = Expected - Real.

            percentage_diff = 0
            if expected_cost > 0:
                percentage_diff = (difference / expected_cost) * 100

            months_data.append(
                {
                    "month_name": month_name[i],
                    "actual_cost": m_fuel,
                    "expected_cost": expected_cost,
                    "difference": difference,
                    "percentage": percentage_diff,
                    "km": m_km,
                }
            )

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.comparative_fuel_cost_wizard",
            "data": data,
            "year": year,
            "months_data": months_data,
            "total_annual_cost": total_annual_cost,
            "total_annual_km": total_annual_km,
            "global_cost_per_km": global_cost_per_km,
            "report_date": get_report_date(),
        }
