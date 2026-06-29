from odoo import http
from odoo.http import request
import json


class TimeController(http.Controller):
    @http.route("/api/v1/parking_meters/time", type="json", auth="user", methods=["POST"], csrf=False)
    def get_time(self, **kwargs):
        try:
            plate_number = kwargs.get("plate_number")
            plate_type_id = kwargs.get("plate_type_id")
  
            if not plate_number or not plate_type_id:
                return {
                    "success": False,
                    "message": "Faltan parámetros obligatorios: número de placa o tipo de placa."
                }

            response = request.env["parking_meters.parking_time"].sudo().get_time_by_plate( **kwargs )
            response_data = json.loads(response)

            return {
                "success": True,
                "message": "Tiempo restante obtenido exitosamente.",
                "data": response_data,
            }

        except Exception as e:
            return {
                "success": False,
                "message": "Error al procesar la solicitud.",
                "error": str(e),
            }
