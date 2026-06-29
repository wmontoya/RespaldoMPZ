from ....models.utils.date_utils import MONTH_SELECTION
from odoo import models, api, _
from ...report_utils import get_report_date


class PrivateCompaniesReport(models.AbstractModel):
    _name = "report.waste_control.private_companies_report"
    _description = "Reporte de empresas privadas"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.private_companies_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        # Dict to map month number string to its localized name
        month_names_map = dict(MONTH_SELECTION)

        # Since 'date' is used, we filter by date range for the year
        date_start = f"{year}-01-01"
        date_end = f"{year}-12-31"
        domain = [("date", ">=", date_start), ("date", "<=", date_end)]

        # Group data by month
        grouped_data = self.env["waste_control.private_companies"].read_group(
            domain=domain,
            fields=["weight_tons:sum", "amount_to_pay:sum"],
            groupby=["month"],
            lazy=False,
        )

        month_data = {
            str(v_month): {"tons": 0.0, "amount": 0.0} for v_month in range(1, 13)
        }

        for group in grouped_data:
            if group.get("month"):
                v_month = str(group["month"])
                month_data[v_month]["tons"] = group.get("weight_tons", 0.0) or 0.0
                month_data[v_month]["amount"] = group.get("amount_to_pay", 0.0) or 0.0

        monthly_list = [
            {
                "name": month_names_map.get(str(v_month), ""),
                "tons": month_data[str(v_month)]["tons"],
                "amount": month_data[str(v_month)]["amount"],
            }
            for v_month in range(1, 13)
        ]

        annual_tons = sum(d["tons"] for d in month_data.values())
        annual_amount = sum(d["amount"] for d in month_data.values())

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.private_companies",
            "selected_year": year,
            "monthly_data": monthly_list,
            "annual_tons": annual_tons,
            "annual_amount": annual_amount,
            "company_currency": self.env.company.currency_id,
            "report_date": get_report_date(),
        }
