from odoo import http
from odoo.http import request


class ProcedureController(http.Controller):
    """Expone los tipos de trámite municipales activos para el SPA de autogestión.

    Mismo patrón que ``ServiceController``: el middleware (yaipan_reports_api) se
    autentica contra Odoo con un ``session_id`` y consume este endpoint JSON.
    """

    @http.route(
        "/api/v1/procedure_types",
        type="json",
        auth="user",
        methods=["POST"],
        csrf=False,
    )
    def list_procedure_types(self, **kwargs):
        try:
            procedure_types = (
                request.env["yaipan_reports.procedure_type"]
                .sudo()
                .search([("active", "=", True)], order="sequence, id")
            )

            data = [
                {
                    "id": procedure_type.id,
                    "name": procedure_type.name,
                    "code": procedure_type.code or "",
                    "description": procedure_type.description or "",
                    "icon": procedure_type.icon or "",
                    "color": procedure_type.color or "",
                    "requires_property": procedure_type.requires_property,
                }
                for procedure_type in procedure_types
            ]

            return {
                "success": True,
                "data": data,
                "message": "Tipos de trámite obtenidos correctamente.",
            }
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "message": f"Error al obtener los tipos de trámite: {str(e)}",
            }
