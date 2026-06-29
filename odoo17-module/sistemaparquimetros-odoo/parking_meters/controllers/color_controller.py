from odoo import http
from odoo.http import request


class ColorController(http.Controller):

    @http.route("/api/v1/parking_meters/colors", type="json", auth="user", methods=["POST"], csrf=False)
    def colors(self):
        try:
            request.env.cr.execute("""
                SELECT color_code_id, COUNT(*) as usage_count
                FROM parking_meters_infraction
                WHERE color_code_id IS NOT NULL
                GROUP BY color_code_id
                ORDER BY usage_count DESC
                LIMIT 10
            """)
            top_colors_data = request.env.cr.fetchall()
            top_color_ids = [row[0] for row in top_colors_data]
            usage_dict = dict(top_colors_data)

            all_colors = request.env["parking_meters.color"].sudo().search([])

            top_colors = []
            other_colors = []

            for color in all_colors:
                color_info = {
                    "id": color.id,
                    "color": color.color,
                    "usage_count": usage_dict.get(color.id, 0)
                }
                if color.id in top_color_ids:
                    top_colors.append(color_info)
                else:
                    other_colors.append(color_info)

            top_colors.sort(key=lambda x: x["usage_count"], reverse=True)
            other_colors.sort(key=lambda x: x["color"])
            color_list = top_colors + other_colors

            return {
                "success": True,
                "message": "Lista completa de colores",
                "data": color_list
            }

        except Exception as e:
            return {
                "success": False,
                "message": "Error al procesar la solicitud.",
                "error": str(e)
            }

