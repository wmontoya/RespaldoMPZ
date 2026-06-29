from odoo import http
from odoo.http import request
import json

class ParkingTimeController(http.Controller):

    @http.route('/api/v1/parking_meters/get_plate_type', type='json', auth='user', methods=['POST'], csrf=False)
    def get_plate_type(self):
        try:
            result = request.env['parking_meters.plate_type'].sudo().get_plates_with_types()
            return {
                "success": True,
                "message": "Datos obtenidos correctamente.",
                "data": result
            }
        except Exception as e:
            return {
                "success": False,
                "message": "Error al obtener las placas.",
                "error": str(e)
            }
