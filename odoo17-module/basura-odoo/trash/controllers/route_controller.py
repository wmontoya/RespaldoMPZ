from odoo import http
from odoo.http import request
from datetime import date


class RouteController(http.Controller):

    @http.route("/api/v1/trash/routes", type="json", auth="user", methods=["POST"], csrf=False)
    def get_routes(self, **kwargs):
        try:
            today = date.today()
            current_month = today.month
            current_year = today.year

            routes = request.env["trash.route"].sudo().search([])
            rutas_json = []

            for r in routes:
                coords = []

                for segment in r.segment_line_ids:
                    for p in segment.route_line_ids:
                        coords.append([p.latitude, p.longitude])
                    coords.append([0, 0])

                if coords and coords[-1] == [0, 0]:
                    coords.pop()

                collection_days = []

                for d in r.day_ids:
                    quincenal_dates = []

                    if d.day_iteration == "QUINCENAL":
                        quincenal_dates = d.quincenal_date_ids.filtered(
                            lambda q: q.collection_date
                            and q.collection_date.month == current_month
                            and q.collection_date.year == current_year
                        ).sorted(
                            key=lambda q: q.collection_date
                        )[:2]
                    collection_days.append({
                        "id": d.id,
                        "waste_type": d.waste_type,
                        "iteration": d.day_iteration,
                        "days": [day.display_name for day in d.day_ids],
                        "collection_time": d.collection_time,
                        "sector": d.sector_id.name_sector,
                        "quincenal_dates": [
                            q.collection_date
                            for q in quincenal_dates
                        ]
                    })

                rutas_json.append({
                    "id": r.id,
                    "name": r.name,
                    "code": r.code,
                    "description": r.description,
                    "color": r.color,
                    "collection_days": collection_days,
                    "segments": coords
                })

            return {
                "success": True,
                "message": "Lista completa de rutas",
                "data": rutas_json
            }

        except Exception as e:
            return {
                "success": False,
                "message": "Error al obtener rutas",
                "error": str(e)
            }
