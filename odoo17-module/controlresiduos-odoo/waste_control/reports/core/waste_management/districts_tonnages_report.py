from odoo import models, api, _
from ...report_utils import (
    aggregate_by_month_and_group,
    build_rows_from_grid,
    get_report_date,
)


class DistrictsTonnagesReport(models.AbstractModel):
    _name = "report.waste_control.districts_tonnages_report"
    _description = "Reporte de tonelajes de distritos"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.districts_tonnages_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        # Usar utilidad para agregación por mes y distrito
        grid, districts_map, monthly_total, month_names = aggregate_by_month_and_group(
            self.env,
            "waste_control.communities_waste_reports",
            year,
            "tons",
            "districts_id",
            date_field="date",
        )

        # Construir filas usando utilidad
        rows = build_rows_from_grid(grid, districts_map, sort_by_name=True)

        # Agregar fila de total
        total_vals = [monthly_total[v_month] for v_month in range(1, 13)]
        rows.append(
            {
                "name": _("Total"),
                "values": total_vals,
                "total": sum(total_vals),
                "is_bold": True,
            }
        )

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.communities_waste_reports",
            "selected_year": str(year),
            "month_names": month_names,
            "rows": rows,
            "report_date": get_report_date(),
        }
