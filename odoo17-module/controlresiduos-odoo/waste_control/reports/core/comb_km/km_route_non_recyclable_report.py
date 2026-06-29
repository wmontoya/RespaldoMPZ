from odoo import models, api, _
from calendar import month_name
from ...report_utils import get_report_date


class KmRouteNonRecyclableReport(models.AbstractModel):
    _name = "report.waste_control.km_route_non_recyclable_report"
    _description = "Reporte de Km por ruta (no reciclable)"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.km_route_non_recyclable_wizard"].browse(docids)
        wizard.ensure_one()
        year = wizard.year

        domain = [
            ("date", ">=", f"{year}-01-01"),
            ("date", "<=", f"{year}-12-31"),
            "|",
            ("types_of_waste_id.name", "ilike", "No aprovechable"),
            ("types_of_waste_id.name", "ilike", "Basura"),
        ]

        grouped_data = self.env["waste_control.kilometers_traveled"].read_group(
            domain=domain,
            fields=["total_km:sum", "routes_id", "month"],
            groupby=["month", "routes_id"],
            lazy=False,
        )

        route_rows = {}
        comercial_row = {x: 0.0 for x in range(1, 13)}

        def is_comercial(name):
            if not name:
                return False
            return "comercial" in name.lower()

        for group in grouped_data:
            month = int(group["month"]) if group.get("month") else 0
            if month not in range(1, 13):
                continue

            routes_id = group.get("routes_id")
            route_name = routes_id[1] if routes_id else "Unknown"

            km = group.get("total_km", 0.0) or 0.0

            if is_comercial(route_name):
                comercial_row[month] += km
            else:
                if route_name not in route_rows:
                    route_rows[route_name] = {x: 0.0 for x in range(1, 13)}
                route_rows[route_name][month] += km

        rows = []

        for r_name in sorted(route_rows.keys()):
            vals = [route_rows[r_name][m] for m in range(1, 13)]
            total = sum(vals)
            if total > 0:
                rows.append(
                    {
                        "name": r_name,
                        "data": vals,
                        "total": total,
                        "monthly_average": total / 12.0,
                    }
                )

        comercial_vals = [comercial_row[m] for m in range(1, 13)]
        if sum(comercial_vals) > 0:
            rows.append(
                {
                    "name": "COMERCIAL",
                    "data": comercial_vals,
                    "total": sum(comercial_vals),
                    "monthly_average": sum(comercial_vals) / 12.0,
                }
            )

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.km_route_non_recyclable_wizard",
            "selected_year": year,
            "month_headers": [month_name[i] for i in range(1, 13)],
            "rows": rows,
            "report_date": get_report_date(),
        }
