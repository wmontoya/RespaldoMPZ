from odoo import http
from odoo.http import request
import json

class ParkingTimeController(http.Controller):

    @http.route('/api/v1/parking_meters/create_parking_time', type='json', auth='public', methods=['POST'], csrf=False)
    def create_parking_time(self, **kwargs):
        try:
            result = request.env['parking_meters.parking_time'].sudo().create_parking_time(**kwargs)
            return json.loads(result)
        except Exception as e:
            return {
                "success": False,
                "message": "Error al crear el tiempo de estacionamiento.",
                "error": str(e)
            }
    @http.route('/api/v1/parking_meters/set_parking_time_consulted', type='json', auth='user', methods=['POST'], csrf=False)
    def set_parking_time_consulted(self, **kwargs):
        try:
            parking_time_id = kwargs.get('id')
            if not parking_time_id:
                return {
                    "success": False,
                    "message": "ID no proporcionado."
                }

            parking_time = request.env['parking_meters.parking_time'].sudo().browse(parking_time_id)

            if not parking_time.exists():
                return {
                    "success": False,
                    "message": f"No se encontró el tiempo de estacionamiento con ID {parking_time_id}."
                }

            parking_time.consulted = True

            return {
                "success": True,
                "message": "ok",
                "data": {"id": parking_time_id, "consulted": True}
            }

        except Exception as e:
            return {
                "success": False,
                "message": "Error al actualizar el estado consultado.",
                "error": str(e)
            }
