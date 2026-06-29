from odoo import models, api, _
from odoo.exceptions import UserError
from calendar import month_name
from ...report_utils import get_report_date


class WastePercentageReport(models.AbstractModel):
    _name = "report.waste_control.waste_percentage_report"
    _description = "Reporte de porcentaje de residuos"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.waste_percentage_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"

        # Get all waste types
        waste_types = self.env["waste_control.types_of_waste"].search([])
        sorted_types = sorted(waste_types, key=lambda x: x.name)
        type_ids = [t.id for t in sorted_types]

        # Fetch all waste data
        all_waste = self.env["waste_control.waste"].search(
            [("date", ">=", start_date), ("date", "<=", end_date)]
        )

        rows = []

        # Structure for Annual Totals
        annual_type_totals = {tid: 0.0 for tid in type_ids}
        annual_total_tons = 0.0

        for i in range(1, 13):
            m_name = month_name[i]
            m_waste = all_waste.filtered(lambda w: w.date.month == i)

            row = {"month": m_name, "types_pct": {}, "total_tons": 0.0}

            # Calculate tons first
            current_month_type_tons = {}
            for tid in type_ids:
                type_tons = sum(
                    w.tons for w in m_waste if w.types_of_waste_id.id == tid
                )
                current_month_type_tons[tid] = type_tons
                row["total_tons"] += type_tons
                annual_type_totals[tid] += type_tons

            annual_total_tons += row["total_tons"]

            # Convert to percentages
            for tid in type_ids:
                tons = current_month_type_tons[tid]
                pct = 0.0
                if row["total_tons"] > 0:
                    pct = (tons / row["total_tons"]) * 100
                row["types_pct"][tid] = pct

            rows.append(row)

        # Annual Percentages
        annual_type_pct = {}
        for tid in type_ids:
            tons = annual_type_totals[tid]
            pct = 0.0
            if annual_total_tons > 0:
                pct = (tons / annual_total_tons) * 100
            annual_type_pct[tid] = pct

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.waste_percentage_wizard",
            "data": data,
            "year": year,
            "months_data": rows,
            "waste_types": sorted_types,
            "annual_type_pct": annual_type_pct,
            "annual_total_tons": annual_total_tons,
            "report_date": get_report_date(),
        }
