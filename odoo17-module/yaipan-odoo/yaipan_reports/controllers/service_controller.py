from odoo import http
from odoo.http import request


class ServiceController(http.Controller):

    @http.route(
        "/api/v1/services",
        type="json",
        auth="user",
        methods=["POST"],
        csrf=False,
    )
    def list_services(self, **kwargs):
        try:
            services = (
                request.env["yaipan_reports.service"]
                .sudo()
                .search([("active", "=", True)], order="sequence, id")
            )

            data = [
                {
                    "id": service.id,
                    "title": service.name,
                    "description": service.description or "",
                    "color": service.color or "",
                    "icon": service.icon or "",
                    "url": service.url or "",
                    "is_external": service.is_external,
                }
                for service in services
            ]

            return {
                "success": True,
                "data": data,
                "message": "Servicios obtenidos correctamente.",
            }
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "message": f"Error al obtener los servicios: {str(e)}",
            }
