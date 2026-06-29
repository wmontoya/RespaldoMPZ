from odoo import http
from odoo.http import request

class ParkingRateController(http.Controller):

    @http.route('/api/v1/parking_meters/get_parking_rate', type='json', auth='user', methods=['POST'], csrf=False)
    def get_parking_rate(self):
        try:
            result = request.env['parking_meters.parking_rate'].sudo().get_minutes_price()
            return {
                "success": True,
                "message": "Datos obtenidos correctamente.",
                "data": result
            }
        except Exception as e:
            return {
                "success": False,
                "message": "Error al obtener el tiempo de boletas.",
                "error": str(e)
            }
