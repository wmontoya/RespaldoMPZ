from odoo import http
from odoo.http import request

class ParameterController(http.Controller):

    @http.route("/api/v1/parking_meters/parameter", type="json", auth="user", methods=["POST"], csrf=False)
    def parameter(self, **kwargs):
        try:
            parameter_name = kwargs.get("parameter_name")
            if not parameter_name:
                return {"success": False, "message": "El nombre del parámetro es obligatorio."}

            parameter_value = request.env["ir.config_parameter"].sudo().get_parameters([parameter_name])

            if parameter_name not in parameter_value or not parameter_value[parameter_name]:
                return {"success": False, "message": f"No se encontró el valor para el parámetro '{parameter_name}'."}

            return {
                "success": True,
                "message": f"Valor del parámetro '{parameter_name}' encontrado.",
                "data": {"parameter_value": parameter_value[parameter_name]},
            }

        except Exception as e:
            return {"success": False, "message": "Error al procesar la solicitud.", "error": str(e)}
