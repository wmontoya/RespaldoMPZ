from odoo import http
from odoo.http import request, Response
from odoo.exceptions import UserError
import json


class YaipanController(http.Controller):
    @http.route(
        "/api/v1/consultarpersona/<string:ced>",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def consultarpersona(self, ced):
        try:
            # Obtener la conexión de Yaipan
            yaipan_connection = request.env["online_payments.yaipan_connection"].sudo()

            # Preparar los parámetros para la consulta
            parameters = {"cedula": ced}
            formatted_parameters = ";".join(f"{key}:{value}" for key, value in parameters.items())

            # Llamar al método `yaipan_person_request`
            api_response = yaipan_connection.yaipan_person_request(
                type="GET", method="get", parameters=formatted_parameters
            )

            # Devolver la respuesta en formato JSON
            return Response(
                json.dumps({"success": True, "data": api_response}),
                content_type="application/json",
                status=200
            )

        except Exception as e:
            # Manejar excepciones y devolver error en formato JSON
            return Response(
                json.dumps({"success": False, "error": str(e)}),
                content_type="application/json",
                status=500
            )
