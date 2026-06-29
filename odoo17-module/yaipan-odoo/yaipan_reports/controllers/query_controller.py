from odoo import http
from odoo.http import request

class QueryController(http.Controller):

    @http.route('/api/v1/<string:directory_name>/<string:query_name>', type='json', auth='user', methods=['POST'], csrf=False)
    def dynamic_query_controller(self, directory_name, query_name, **kwargs):
        try:
            datos = request.env["yaipan_reports.oracle"].ejecutar_query_oracle(
                f"{directory_name}/{query_name}_query.sql",
                parametros=kwargs
            )
            return {
                "data": datos,
                "success": True,
                "message": f"Consulta '{directory_name}/{query_name}' ejecutada correctamente."
            }
        except Exception as e:
            return {
                "data": None,
                "success": False,
                "message": f"Error al ejecutar la consulta: {str(e)}"
            }