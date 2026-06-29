from odoo import models, api, _
from calendar import month_name
from ...report_utils import get_report_date


class MeatWasteReport(models.AbstractModel):
    _name = "report.waste_control.meat_waste_report"
    _description = "Reporte de residuos cárnicos"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.meat_waste_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        domain = [("year", "=", year)]

        # Group by month
        grouped_data = self.env["waste_control.meat_waste"].read_group(
            domain=domain,
            fields=["kilograms:sum"],
            groupby=["month"],
            lazy=False,
        )

        month_data = {v_month: 0.0 for v_month in range(1, 13)}

        for group in grouped_data:
            if group.get("month"):
                v_month = int(group["month"])
                month_data[v_month] = group.get("kilograms", 0.0) or 0.0

        monthly_list = [
            {"name": month_name[v_month], "kilograms": month_data[v_month]}
            for v_month in range(1, 13)
        ]

        annual_total = sum(month_data.values())

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.meat_waste",
            "selected_year": year,
            "monthly_data": monthly_list,
            "annual_total": annual_total,
            "report_date": get_report_date(),
        }
