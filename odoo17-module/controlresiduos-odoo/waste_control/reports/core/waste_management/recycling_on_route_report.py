from ....models.utils.date_utils import MONTH_SELECTION
from odoo import models, api, _
from ...report_utils import get_report_date


class RecyclingOnRouteReport(models.AbstractModel):
    _name = "report.waste_control.recycling_on_route_report"
    _description = "Reporte de reciclaje en ruta"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.recycling_on_route_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        month_names_map = dict(MONTH_SELECTION)

        domain = [("year", "=", year)]

        routes_data = self.env["waste_control.recycling_on_route"].read_group(
            domain=domain, fields=["routes_id"], groupby=["routes_id"]
        )
        routes_list = []
        for r in routes_data:
            if r.get("routes_id"):
                routes_list.append({"id": r["routes_id"][0], "name": r["routes_id"][1]})
        routes_list.sort(key=lambda x: x["name"])

        grid = {
            r["id"]: {str(v_month): 0.0 for v_month in range(1, 13)}
            for r in routes_list
        }

        no_aprovechable_monthly = {str(v_month): 0.0 for v_month in range(1, 13)}
        reciclado_monthly = {str(v_month): 0.0 for v_month in range(1, 13)}

        grouped_data = self.env["waste_control.recycling_on_route"].read_group(
            domain=domain,
            fields=[
                "tons:sum",
                "other_non_recoverable:sum",
                "rejected_amount:sum",
                "routes_id",
            ],
            groupby=["month", "routes_id"],
            lazy=False,
        )

        for group in grouped_data:
            v_month = str(group["month"]) if group.get("month") else None
            r_id = group.get("routes_id")[0] if group.get("routes_id") else False

            tons = group.get("tons", 0.0) or 0.0
            other = group.get("other_non_recoverable", 0.0) or 0.0
            rejected = group.get("rejected_amount", 0.0) or 0.0

            if r_id and v_month in [str(i) for i in range(1, 13)]:
                if r_id in grid:
                    grid[r_id][v_month] += tons

                # Total Collected includes Tons (all collected recycling material) + Other (trash)
                # Recycled = Tons - Rejected
                # No Aprovechable = Other + Rejected

                reciclado_monthly[v_month] += tons - rejected
                no_aprovechable_monthly[v_month] += other + rejected

        rows = []
        for r in routes_list:
            vals = [grid[r["id"]][str(v_month)] for v_month in range(1, 13)]
            total = sum(vals)
            rows.append(
                {"name": r["name"], "values": vals, "total": total, "is_bold": False}
            )

        reciclado_vals = [reciclado_monthly[str(v_month)] for v_month in range(1, 13)]
        no_aprovechable_vals = [
            no_aprovechable_monthly[str(v_month)] for v_month in range(1, 13)
        ]
        total_recolectado_vals = [
            reciclado_monthly[str(v_month)] + no_aprovechable_monthly[str(v_month)]
            for v_month in range(1, 13)
        ]

        rows.append(
            {"name": _("Others"), "values": [0.0] * 12, "total": 0.0, "is_bold": True}
        )
        rows.append(
            {
                "name": _("No recuperable"),
                "values": no_aprovechable_vals,
                "total": sum(no_aprovechable_vals),
                "is_bold": True,
            }
        )
        rows.append(
            {
                "name": _("Total recolectado por mes"),
                "values": total_recolectado_vals,
                "total": sum(total_recolectado_vals),
                "is_bold": True,
            }
        )
        rows.append(
            {
                "name": _("Total reciclado"),
                "values": reciclado_vals,
                "total": sum(reciclado_vals),
                "is_bold": True,
            }
        )

        avg_monthly = sum(total_recolectado_vals) / 12.0

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.recycling_on_route",
            "selected_year": str(year),
            "month_names": [month_names_map.get(str(m), "") for m in range(1, 13)],
            "rows": rows,
            "monthly_average": avg_monthly,
            "report_date": get_report_date(),
        }
