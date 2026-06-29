from odoo import models, api, _
from calendar import month_name
from ...report_utils import get_report_date


class BuenosAiresTonnagesReport(models.AbstractModel):
    _name = "report.waste_control.buenos_aires_tonnages_report"
    _description = "Reporte de tonelajes de Buenos Aires"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.buenos_aires_tonnages_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        # 'year' not in model, so we must filter by date range
        date_start = f"{year}-01-01"
        date_end = f"{year}-12-31"

        domain = [("billing_date", ">=", date_start), ("billing_date", "<=", date_end)]

        grouped_data = self.env["waste_control.buenos_aires_tonnages"].read_group(
            domain=domain,
            fields=["tons:sum"],
            groupby=["month"],
            lazy=False,
        )

        month_data = {v_month: 0.0 for v_month in range(1, 13)}

        for group in grouped_data:
            if group.get("month"):
                v_month = int(group["month"])
                month_data[v_month] = group.get("tons", 0.0) or 0.0

        monthly_list = [
            {"name": month_name[v_month], "tons": month_data[v_month]}
            for v_month in range(1, 13)
        ]

        annual_total = sum(month_data.values())
        monthly_average = annual_total / 12.0

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.buenos_aires_tonnages",
            "selected_year": year,
            "monthly_data": monthly_list,
            "annual_total": annual_total,
            "monthly_average": monthly_average,
            "report_date": get_report_date(),
        }
