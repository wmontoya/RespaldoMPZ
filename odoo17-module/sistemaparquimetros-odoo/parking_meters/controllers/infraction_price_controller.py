from odoo import http
from odoo.http import request

class InfractionPriceController(http.Controller):

    @http.route("/api/v1/parking_meters/price", type="json", auth="user", methods=["POST"], csrf=False)
    def price(self):
        try:
            domain = [("id", ">", "0")]

            price_record = request.env["parking_meters.infraction_price"].sudo().search(domain, order="update_date desc", limit=1)

            if not price_record:
                return {"success": False, "message": "No se encontraron registros de precio registrado."}

            data = {"id": price_record.id, "price": price_record.price, "update_date": price_record.update_date}

            return {"success": True, "message": "Registro encontrado.", "data": data}

        except Exception as e:
            return {"success": False, "message": "Error al procesar la solicitud.", "error": str(e)}
