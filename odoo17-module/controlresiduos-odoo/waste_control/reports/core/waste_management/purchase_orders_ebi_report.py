from odoo import models, api, _
from ...report_utils import get_report_date


class PurchaseOrdersEBIReport(models.AbstractModel):
    _name = "report.waste_control.purchase_orders_ebi_report"
    _description = "Reporte de órdenes de compra EBI"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.purchase_orders_ebi_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        domain = [("year", "=", year)]

        grouped_data = self.env["waste_control.purchase_orders_ebi"].read_group(
            domain=domain,
            fields=["tonnages:sum", "cost:sum"],
            groupby=[
                "year"
            ],  # We just need annual total really, but grouping by year ensures one row
            lazy=False,
        )

        annual_tonnages = 0.0
        annual_cost = 0.0

        if grouped_data:
            annual_tonnages = grouped_data[0].get("tonnages", 0.0) or 0.0
            annual_cost = grouped_data[0].get("cost", 0.0) or 0.0

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.purchase_orders_ebi",
            "selected_year": year,
            "annual_tonnages": annual_tonnages,
            "annual_cost": annual_cost,
            "company_currency": self.env.company.currency_id,
            "report_date": get_report_date(),
        }
