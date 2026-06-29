from odoo import models, api, fields, _
from ...report_utils import get_report_date


class CommunitiesWasteReport(models.AbstractModel):
    _name = "report.waste_control.communities_waste_report"
    _description = "Reporte de residuos de comunidades"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.communities_waste_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        date_start = f"{year}-01-01"
        date_end = f"{year}-12-31"
        domain = [("date", ">=", date_start), ("date", "<=", date_end)]

        # Simple list of records, as per requirement Item 9: "tabla con los respectivos valores de cada campo"
        # It's a detailed list, not a summary matrix
        docs = self.env["waste_control.communities_waste_reports"].search(
            domain, order="date asc"
        )

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.communities_waste_reports",
            "selected_year": year,
            "docs": docs,
            "report_date": get_report_date(),
        }
