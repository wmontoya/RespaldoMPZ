from odoo import http
from odoo.http import request


class VehicleController(http.Controller):

    @http.route("/api/v1/parking_meters/vehicles", type="json", auth="user", methods=["POST"], csrf=False)
    def vehicles(self):
        try:
            request.env.cr.execute("""
                SELECT vehicle_code_id, COUNT(*) as usage_count
                FROM parking_meters_infraction
                WHERE vehicle_code_id IS NOT NULL
                GROUP BY vehicle_code_id
                ORDER BY usage_count DESC
                LIMIT 10
            """)
            top_vehicles_data = request.env.cr.fetchall()
            top_vehicle_ids = [row[0] for row in top_vehicles_data]
            usage_dict = dict(top_vehicles_data)

            all_vehicles = request.env["parking_meters.vehicle_type"].sudo().search([])

            top_vehicles = []
            other_vehicles = []

            for vehicle in all_vehicles:
                vehicle_info = {
                    "id": vehicle.id,
                    "description": vehicle.description,
                    "usage_count": usage_dict.get(vehicle.id, 0)
                }
                if vehicle.id in top_vehicle_ids:
                    top_vehicles.append(vehicle_info)
                else:
                    other_vehicles.append(vehicle_info)

            top_vehicles.sort(key=lambda x: x["usage_count"], reverse=True)
            other_vehicles.sort(key=lambda x: x["description"])
            vehicle_list = top_vehicles + other_vehicles

            return {
                "success": True,
                "message": "Lista completa de Vehiculos",
                "data": vehicle_list
            }

        except Exception as e:
            return {
                "success": False,
                "message": "Error al procesar la solicitud.",
                "error": str(e)
            }
        
