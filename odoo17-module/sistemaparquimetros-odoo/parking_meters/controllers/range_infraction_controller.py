from odoo import http
from odoo.http import request

class RangeInfractionController(http.Controller):

    @http.route("/api/v1/parking_meters/range", type="json", auth="user", methods=["POST"], csrf=False)
    def range(self):
        try:
            user = request.env.user
            domain = [("user_code_id", "=", user.id)]

            range_record = request.env["parking_meters.range_infraction"].sudo().search(domain, limit=1)

            if not range_record:
                return {"success": False, "message": "No se encontraron registros para el usuario actual."}

            data = {
                "id": range_record.id,
                "ticket_number": range_record.ticket_number,
                "start_range": range_record.start_range,
                "end_range": range_record.end_range,
                "user_id": range_record.user_code_id.id,
            }

            return {"success": True, "message": "Registro encontrado.", "data": data}

        except Exception as e:
            return {"success": False, "message": "Error al procesar la solicitud.", "error": str(e)}
