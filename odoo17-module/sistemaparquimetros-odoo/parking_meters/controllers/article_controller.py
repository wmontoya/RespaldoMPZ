from odoo import http
from odoo.http import request
import json

class ArticleController(http.Controller):

    @http.route('/api/v1/parking_meters/get_articles', type='json', auth='user', methods=['POST'], csrf=False)
    def get_articles(self):
        try:
            result = request.env['parking_meters.article'].sudo().get_articles_with_clauses()
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
