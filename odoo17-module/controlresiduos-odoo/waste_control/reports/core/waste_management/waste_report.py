from odoo import models, api, _
from calendar import month_name
from ...report_utils import get_report_date


class WasteReport(models.AbstractModel):
    _name = "report.waste_control.waste_report"
    _description = "Reporte de residuos por ruta"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.waste_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        domain = [("year", "=", year)]

        # Get data grouped by month, route, and type
        grouped_data = self.env["waste_control.waste"].read_group(
            domain=domain,
            fields=["tons:sum", "routes_id", "types_of_waste_id"],
            groupby=["month", "routes_id", "types_of_waste_id"],
            lazy=False,
        )

        # Structures to hold data
        # Ordinary routes: {route_name: {month: tons}}
        route_rows = {}
        # Special categories: {category_name: {month: tons}}
        special_rows = {
            "Comercial": {x: 0.0 for x in range(1, 13)},
            "Otros": {x: 0.0 for x in range(1, 13)},
            "Reciclaje": {x: 0.0 for x in range(1, 13)},
            "Orgánico": {x: 0.0 for x in range(1, 13)},
        }

        monthly_total_all = {x: 0.0 for x in range(1, 13)}

        for group in grouped_data:
            v_month = int(group["month"]) if group.get("month") else None
            # Skip if valid month
            if not v_month or v_month not in range(1, 13):
                continue

            r_id = group["routes_id"][0] if group.get("routes_id") else False
            r_name = group["routes_id"][1] if group.get("routes_id") else False

            t_name = (
                group["types_of_waste_id"][1]
                if group.get("types_of_waste_id")
                else False
            )

            tons = group.get("tons", 0.0) or 0.0

            # Logic to categorize
            # 1. Specialized Types take precedence?
            # Report says: Reciclaje, Orgánico, Comercial, Otros are specific rows.
            # Rutas ... are remaining rows.

            category = None

            if t_name and "Reciclaje" in t_name:
                category = "Reciclaje"
            elif t_name and "Orgánico" in t_name:
                category = "Orgánico"
            elif (t_name and "Comercial" in t_name) or (
                r_name and "Comercial" in r_name
            ):
                category = "Comercial"
            elif not r_name or (t_name and "Otros" in t_name):
                # Delivered by used or no route
                category = "Otros"

            if category:
                special_rows[category][v_month] += tons
            else:
                # Ordinary Route
                # Use route name
                if r_name not in route_rows:
                    route_rows[r_name] = {x: 0.0 for x in range(1, 13)}
                route_rows[r_name][v_month] += tons

            monthly_total_all[v_month] += tons

        # Build final rows
        rows = []

        # 1. Routes (Sorted)
        sorted_routes = sorted(route_rows.keys())
        for r_name in sorted_routes:
            vals = [route_rows[r_name][m] for m in range(1, 13)]
            rows.append(
                {"name": r_name, "values": vals, "total": sum(vals), "is_bold": False}
            )

        # 2. Special Categories (Fixed Order)
        # Order in requirement: Comercial, Otros, Reciclaje, Orgánico
        cat_order = ["Comercial", "Otros", "Reciclaje", "Orgánico"]
        for cat in cat_order:
            vals = [special_rows[cat][m] for m in range(1, 13)]
            rows.append(
                {
                    "name": cat,  # Use translation if needed, but keys are hardcoded for now
                    "values": vals,
                    "total": sum(vals),
                    "is_bold": False,  # Or true? Requirement table doesn't bold them, only Total
                }
            )

        # 3. Total
        vals_total = [monthly_total_all[m] for m in range(1, 13)]
        rows.append(
            {
                "name": _("Total"),
                "values": vals_total,
                "total": sum(vals_total),
                "is_bold": True,
            }
        )

        # Average
        grand_total = sum(vals_total)
        monthly_average = grand_total / 12.0

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.waste",
            "selected_year": str(year),
            "month_names": [month_name[v_month] for v_month in range(1, 13)],
            "rows": rows,
            "monthly_average": monthly_average,
            "report_date": get_report_date(),
        }
