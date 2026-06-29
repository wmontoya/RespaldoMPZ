from odoo import http
from odoo.http import request
import json

class PaymentController(http.Controller):

    @http.route('/api/v1/parking_meters/get_payment', type='json', auth='public', methods=['POST'], csrf=False)
    def create_parking_time(self, **kwargs):
        try:
            payment = request.env["online_payments.payment"].check_status(kwargs.get("tem_invoice"))
            if not payment or not payment.get("data"):
                return {
                    "success": False,
                    "message": "No se encontró información de pago."
                }

            payment_data = payment.get("data")
            
            request_data = payment_data.get("request", {})
            payer = request_data.get("payer", {})
            payment_info = request_data.get("payment", {})
            status = payment_data.get("status", {})
            description = payment_info.get("description")
    
            if description and ":" in description:
                infraction = description.split(":", 1)[1]
            else:
                infraction = 0 

            losDatosFinales = {
           
                "date": status.get("date", ""),
                "status": (
                    "APROBADA" if status.get("status") == "APPROVED"
                    else "RECHAZADA" if status.get("status") == "REJECTED"
                    else "PENDIENTE"
                ),
                "amount": payment_info.get("amount", {}).get("total", 0),
                "identification": payer.get("document", ""),
                "email": payer.get("email", ""),
                "phone": payer.get("mobile", ""),
                "name":payer.get("name", ""),
                "surname": payer.get("surname", ""),
                "description":status.get("message"),
                "details": payment_info.get("description", "")
            }

           
            if int(infraction) > 0:
                losDatosFinales["ticket_number"] = infraction

            return {
                "success": True,
                "data": losDatosFinales
            }

        except Exception as e:
            return {
                "success": False,
                "message": "Error al obtener el estado del pago.",
                "error": str(e)
            }

    @http.route('/api/v1/parking_meters/insert_payment', type='json', auth='user', methods=['POST'], csrf=False)
    def insert_payment(self, **kwargs):
        try:
            result = request.env["parking_meters.infraction"].sudo().insert_payment(**kwargs)
            return result
        except Exception as e:
            return {
                "success": False,
                "message": "Error al insertar el pago.",
                "error": str(e)
            }
