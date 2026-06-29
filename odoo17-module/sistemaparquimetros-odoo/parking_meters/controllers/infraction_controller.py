import json
from odoo import http
from odoo.http import request
from datetime import datetime, timedelta


class InfractionController(http.Controller):

    @http.route('/api/v1/parking_meters/infractions', type='json', auth='user', methods=['POST'], csrf=False)
    def infractions(self, **kwargs):
        try:
            plate_number = kwargs.get("plate_number")
            plate_type_id = int(kwargs.get("plate_type_id"))
            ticket_number = kwargs.get("ticket_number")
            goverment_code = kwargs.get("goverment_code")
            is_today = kwargs.get("is_today", "false").lower() in ["true", "1", "yes"]
            today = datetime.today()
            today_string = today.strftime('%Y-%m-%d')

            domain = []
            if ticket_number:
                domain.append(("ticket_number", "=", ticket_number))
            else:
                if plate_number:
                    domain.append(("plate_number", "=", plate_number))
                if plate_type_id:
                    domain.append(("plate_type_id", "=", plate_type_id))
                if is_today:
                    domain.append(("registration_date", ">=", today_string))
                if goverment_code:
                    domain.append(("plate_detail_id", "=", goverment_code))

            infractions = request.env["parking_meters.infraction"].sudo().search(domain)

            infraction_list = []
            for infraction in infractions:
                if infraction.infraction_state_id.id == 1:
                    price = infraction.infraction_price_id.price
                    current_date = datetime.now()
                    infraction_date = infraction.registration_date
                    day_counter = (current_date - infraction_date).days

                    if day_counter <= 2:
                        infraction.surcharge = 0.0
                    elif 2 < day_counter <= 30:
                        infraction.surcharge = price * 0.02
                    else:
                        diferencia_meses = round((day_counter - 2) / 30)
                        monto_temp = price
                        for _ in range(diferencia_meses):
                            monto_temp = monto_temp * 1.02
                        infraction.surcharge = monto_temp - price
                registration_date = ( infraction.registration_date - timedelta(hours=6) if infraction.registration_date else None )           
                infraction_list.append({
                    "id": infraction.id,
                    "ticket_number": infraction.ticket_number,
                    "plate_number": infraction.plate_number,
                    "plate_type": infraction.plate_type_id.id if infraction.plate_type_id else None,
                    "plate_type_description": infraction.plate_type_id.description if infraction.plate_type_id else None,
                    "plate_detail": infraction.plate_detail_id.id if infraction.plate_detail_id else None,
                    "infraction_price": infraction.infraction_price_id.id if infraction.infraction_price_id else None,
                    "infraction_amount": infraction.infraction_price_id.price if infraction.infraction_price_id else None,
                    "first_location": infraction.first_location,
                    "second_location": infraction.second_location,
                    "third_location": infraction.third_location,
                    "infraction_state": infraction.infraction_state_id.id if infraction.infraction_state_id else None,
                    "infraction_state_description": infraction.infraction_state_id.description if infraction.infraction_state_id else None,
                    "registration_date": infraction.registration_date.strftime('%Y-%m-%d %H:%M:%S'),
                    "brand_code": infraction.brand_code_id.id if infraction.brand_code_id else None,
                    "color_code": infraction.color_code_id.id if infraction.color_code_id else None,
                    "article_code": infraction.article_code_id.id if infraction.article_code_id else None,
                    "clause_code": infraction.clause_code_id.id if infraction.clause_code_id else None,
                    "vehicle_code": infraction.vehicle_code_id.id if infraction.vehicle_code_id else None,
                    "observations": infraction.observations,
                    "latitude": infraction.latitude,
                    "longitude": infraction.longitude,
                    "surcharge": infraction.surcharge,
                    "cancellation_description": infraction.cancellation_description,
                    "inspector_user": infraction.inspector_user_id.name if infraction.inspector_user_id else None
                })

            return {
                "success": True,
                "data": infraction_list,
                "message": f"Se encontraron {len(infraction_list)} infracciones."
            }
        except Exception as e:
            return {
                "success": False,
                "message": "Error al obtener las infracciones.",
                "error": str(e)
            }
    
    @http.route('/api/v1/parking_meters/infraction', type='json', auth='user', methods=['POST'], csrf=False)
    def infraction(self, **kwargs):
        try:
            infraction_data = {
                "ticket_number": kwargs.get("ticket_number"),
                "plate_type_id": kwargs.get("plate_type_id"),
                "plate_number": kwargs.get("plate_number"),
                "plate_detail_id": kwargs.get("plate_detail_id"),
                "infraction_price_id": kwargs.get("infraction_price_id"),
                "first_location": kwargs.get("first_location"),
                "second_location": kwargs.get("second_location"),
                "third_location": kwargs.get("third_location"),
                "infraction_state_id": kwargs.get("infraction_state_id"),
                "registration_date": kwargs.get("registration_date"),
                "payment_date": kwargs.get("payment_date"),
                "brand_code_id": kwargs.get("brand_code_id"),
                "color_code_id": kwargs.get("color_code_id"),
                "article_code_id": kwargs.get("article_code_id"),
                "clause_code_id": kwargs.get("clause_code_id"),
                "vehicle_code_id": kwargs.get("vehicle_code_id"),
                "observations": kwargs.get("observations"),
                "latitude": kwargs.get("latitude"),
                "longitude": kwargs.get("longitude"),
                "surcharge": kwargs.get("surcharge"),
                "cancellation_description": kwargs.get("cancellation_description"),
                "inspector_user_id": kwargs.get("inspector_user_id"),
                "image_list": kwargs.get("image_list"),
            }
            response = request.env["parking_meters.infraction"].sudo().set_infraction(**infraction_data)

            response_data = json.loads(response)

            if "error" in response_data:
                return {
                    "success": False,
                    "message": "Error al registrar la infracción.",
                    "error": response_data["error"]
                }

            return {
                "success": True,
                "data": response_data["data"],
                "message": "Infracción registrada exitosamente."
            }

        except Exception as e:
            return {
                "success": False,
                "message": "Error al procesar la solicitud.",
                "error": str(e)
            }
