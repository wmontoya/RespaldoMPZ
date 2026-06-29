from odoo import models, api, _
from odoo.exceptions import UserError
from calendar import month_name
from ...report_utils import get_report_date


class NonRecyclableWasteReport(models.AbstractModel):
    _name = "report.waste_control.non_recyclable_waste_report"
    _description = "Reporte de residuos no reciclables"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.non_recyclable_waste_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"

        months_list = [month_name[i] for i in range(1, 13)]

        # Fetch waste that corresponds to ""
        # Since we don't have an explicit flag, we might assume "Basura", "Ordinario", "No Valorizable".
        # Or, usually, this report includes ALL waste that is collected by the trucks on "Garbage Routes".
        # Report 15 ("Km per route") had "Comercial".

        # We will fetch ALL waste records where the route is NOT a recycling route?
        # Or just fetch all waste and group by route.
        # But Report 3 is "Recycling by Route".
        # So Report 4 is "Ordinary by Route".

        # Assumption: We filter by Type. If Type is NOT 'Reciclaje', it's 'No Aprovechable' + 'Organico'?
        # The prompt for Report 4 mentions:
        # "Otros: entregados por usuarios"
        # "Reciclaje: devuelto como no aprovechables"
        # "Orgánico: categoria de orgánicos"

        # I will fetch ALL waste and try to let the template categorize or just list routes.
        # But the snippet shows rows for "Reciclaje", "Orgánico". These are NOT routes. These are Types?
        # If "Reciclaje" is a ROW, and "Rutas" are ROWS, it mixes concepts.
        # It says "Cada fila representa una ruta específica...".
        # Then "| Reciclaje | ...".
        # Maybe "Reciclaje" is treated as a pseudo-route source?

        # Strategy:
        # 1. Group by Route (standard routes).
        # 2. Identify "Special" sources/types that act as rows.

        waste_data = self.env["waste_control.waste"].search(
            [("date", ">=", start_date), ("date", "<=", end_date)]
        )

        routes = self.env["waste_control.routes"].search([])
        route_map = {r.id: r.name for r in routes}

        # Aggregation
        rows = {}  # Key: RouteName or Category

        # Initialize rows for known routes
        for r in routes:
            rows[r.name] = {month_name[i]: 0.0 for i in range(1, 13)}
            rows[r.name]["total_annual"] = 0.0

        # Add special rows
        specials = ["Comercial", "Otros", "Reciclaje", "Orgánico"]
        # Note: 'Comercial' is usually a route name in many implementations, but here listed separately.
        # If 'Comercial' is a route in DB, it's covered above.

        for sp in specials:
            if sp not in rows:
                rows[sp] = {month_name[i]: 0.0 for i in range(1, 13)}
                rows[sp]["total_annual"] = 0.0

        total_monthly = {month_name[i]: 0.0 for i in range(1, 13)}
        total_annual = 0.0

        for w in waste_data:
            m_name = month_name[w.date.month]

            # Logic to assign waste to row
            # If explicit Route, use Route Name.
            # But need to distinguish "No Aprovechable" from "Recyclable".
            # Report 4 is "".
            # If Type == 'Reciclaje' AND NOT Rejected, it goes to Report 3.
            # If Type == 'Reciclaje' AND Rejected (how to know?), it goes here?
            # Or is this report inclusive of everything except pure recycling?

            # Simplifying based on title "Non Recyclable":
            # Just route-based sum.

            row_key = w.routes_id.name if w.routes_id else "Otros"

            # HEURISTIC based on TODO text:
            # "Reciclaje: devuelto como no aprovechables" -> Maybe a Type named 'Reciclaje' in 'waste_control.waste' (which is disposal) implies rejection?
            # "Orgánico" -> Type 'Orgánico'.

            if w.types_of_waste_id.name == "Orgánico":
                row_key = "Orgánico"
            elif (
                w.types_of_waste_id.name == "Reciclaje"
            ):  # Only if considered "Devuelto" or if waste table implies disposal
                row_key = "Reciclaje"
            elif not w.routes_id:
                row_key = "Otros"

            # If row_key not in rows (e.g. filtered out route or new category), add it
            if row_key not in rows:
                rows[row_key] = {month_name[i]: 0.0 for i in range(1, 13)}
                rows[row_key]["total_annual"] = 0.0

            rows[row_key][m_name] += w.tons
            rows[row_key]["total_annual"] += w.tons

            total_monthly[m_name] += w.tons
            total_annual += w.tons

        # -----------------------------------------------------------
        # ADDED LOGIC: Include Rejected Recycling as "Reciclaje" (Non-Recyclable)
        # -----------------------------------------------------------
        recycling_rejected = self.env["waste_control.recycling_on_route"].read_group(
            [("date", ">=", start_date), ("date", "<=", end_date)],
            ["rejected_amount:sum"],
            ["date:month"],
            lazy=False,
        )

        if "Reciclaje" not in rows:
            rows["Reciclaje"] = {month_name[i]: 0.0 for i in range(1, 13)}
            rows["Reciclaje"]["total_annual"] = 0.0

        for group in recycling_rejected:
            # group['date:month'] is "Month Year" string usually, unless granular?
            # read_group with 'date:month' returns localized string 'January 2023'.
            # We need to parse it or rely on ordering?
            # Better to search raw or assume locale matches month_name.
            # For robustness, let's use search again or trust the order if strict.
            # actually for date fields in read_group, the value (group['date:month'])
            # is formatted.
            # Let's search raw to be safe like in waste_disposition_report.
            pass

        # Raw search for rejected recycling
        recycling_recs = self.env["waste_control.recycling_on_route"].search(
            [
                ("date", ">=", start_date),
                ("date", "<=", end_date),
                ("rejected_amount", ">", 0),
            ]
        )

        for r in recycling_recs:
            m_name = month_name[r.date.month]
            amount = r.rejected_amount

            rows["Reciclaje"][m_name] += amount
            rows["Reciclaje"]["total_annual"] += amount

            total_monthly[m_name] += amount
            total_annual += amount
        # -----------------------------------------------------------

        # Format for template
        final_rows = []
        # Sort: Routes A-Z, then Specials?
        # Actually list suggests: Routes... then Commercial, Others, Reciclaje, Organico.

        sorted_keys = sorted([k for k in rows.keys() if k not in specials]) + [
            k for k in specials if k in rows
        ]

        for k in sorted_keys:
            r_data = rows[k]
            final_rows.append(
                {
                    "name": k,
                    "months": [r_data[month_name[i]] for i in range(1, 13)],
                    "annual": r_data["total_annual"],
                }
            )

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.non_recyclable_waste_wizard",
            "data": data,
            "year": year,
            "months": months_list,
            "rows": final_rows,
            "total_monthly": [total_monthly[month_name[i]] for i in range(1, 13)],
            "total_annual": total_annual,
            "monthly_average": total_annual / 12 if total_annual else 0,
            "report_date": get_report_date(),
        }
