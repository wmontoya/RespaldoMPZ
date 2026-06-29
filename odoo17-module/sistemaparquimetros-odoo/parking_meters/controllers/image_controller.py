from odoo import http
from odoo.http import request


class ImageController(http.Controller):

    @http.route("/api/v1/parking_meters/images", type="json", auth="user", methods=["POST"], csrf=False)
    def images(self,**kwargs):
        try:            
            result = request.env['parking_meters.image'].sudo().get_image(**kwargs)
            return {
                    "success": True,
                    "message": "Datos obtenidos correctamente.",
                    "data": result
                }
        except Exception as e:
                return {
                    "success": False,
                    "message": "Error al obtener las imagenes.",
                    "error": str(e)
                }
                
    @http.route("/api/v1/parking_meters/images/save", type="json", auth="user", methods=["POST"], csrf=False)
    def images_save(self,**kwargs):
        try:        
            images_data = kwargs.get("image_list", [])
            ticket_number = kwargs.get("ticket_number", "")
            infraction_id = request.env['parking_meters.infraction'].sudo().search([('ticket_number', '=', ticket_number)], limit=1)
            result = request.env['parking_meters.image'].sudo().save_images(images_data, kwargs.get("ticket_number"), infraction_id.id)
            return {
                    "success": True,
                    "message": "Datos obtenidos correctamente.",
                    "data": result
                }
        except Exception as e:
                return {
                    "success": False,
                    "message": "Error al guardar las imagenes.",
                    "error": str(e)
                }
