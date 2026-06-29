from odoo import http
from odoo.http import request

class UserController(http.Controller):

    @http.route("/api/v1/parking_meters/login_officer", type="json", auth="user", methods=["POST"], csrf=False)
    def login_officer(self):
        try:
            user = request.env.user
            return {
                "success": True,
                "message": "Sesión válida. Usuario autenticado.",
                "data": {
                    "id": user.id,
                    "login": user.login,
                    "name": user.name,
                    "updated_status": user.updated_status,
                    "phone_mac_direction": user.phone_mac_direction,
                },
            }

        except Exception as e:
            return {"success": False, "message": "Error al validar la sesión.", "error": str(e)}

    @http.route("/api/v1/update_officer", type="json", auth="user", methods=["PUT"], csrf=False)
    def update_officer(self):
        try:
            user = request.env.user
            user.sudo().write({"updated_status": "updated"})

            return {
                "success": True,
                "message": "Estado actualizado correctamente.",
            }

        except Exception as e:
            return {"success": False, "message": "Error al actualizar el estado.", "error": str(e)}
