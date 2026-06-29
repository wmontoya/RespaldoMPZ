from odoo import http
from odoo.http import request
from datetime import datetime


class YaipanApiController(http.Controller):

    @http.route(
        "/api/v1/yaipan/persona/pendiente",
        type="json",
        auth="user",
        methods=["POST"],
        csrf=False,
    )
    def yaipan_get_is_pending(self, **kwargs):
        try:
            cedula = kwargs.get("cedula")
            if not cedula:
                return {
                    "success": False,
                    "error": "Falta el parámetro obligatorio: cédula",
                }

            result = (
                request.env["yaipan_reports.yaipan_api_connection"]
                .sudo()
                .yaipan_person_request(
                    "GET",
                    "saldos",
                    "codigoConvenio:003;cedula:"
                    + cedula
                    + ";numeroPagina:1;longitudPagina:300",
                )
            )

            if not result.get("success"):
                return {
                    "success": False,
                    "error": result.get("result", "Error desconocido"),
                }

            if result.get("success") and isinstance(result.get("result"), dict):
                if "error" in result["result"]:
                    error_msg = result["result"]["error"]
                    if error_msg == "Persona en Cobro Judicial":
                        return {"success": True, "pending": True}

            periodo_actual = 4
            now = datetime.now()
            anno_actual = now.year
            mes_actual = now.month

            if mes_actual <= 1:
                anno_actual = anno_actual - 1
            if 1 < mes_actual <= 4:
                periodo_actual = 1
            elif 4 < mes_actual <= 7:
                periodo_actual = 2
            elif 7 < mes_actual <= 10:
                periodo_actual = 3
            else:
                periodo_actual = 4

            datos = result.get("result", {}).get("data", [])

            for item in datos:
                try:
                    periodo_cobro = int(
                        item.get("periodo") or item.get("periodoCobro") or 0
                    )
                except Exception:
                    periodo_cobro = 0
                try:
                    anno_cobro = int(item.get("year") or item.get("anio") or 0)
                except Exception:
                    anno_cobro = 0

                auxiliar = (item.get("auxiliarContable") or "").upper()

                is_patent_period = auxiliar in ("PAT", "LIC")
                is_monthly_period = auxiliar in ("BUS", "MER")

                periodo_a_considerar = periodo_actual
                if is_monthly_period:
                    periodo_a_considerar = mes_actual
                if is_patent_period:
                    periodo_a_considerar = periodo_a_considerar + 1

                vencido_item = False
                if anno_cobro < anno_actual:
                    vencido_item = True
                elif anno_cobro == anno_actual and periodo_cobro < periodo_a_considerar:
                    vencido_item = True

                if is_patent_period:
                    anno_saldo = anno_cobro
                    if (
                        anno_saldo > anno_actual and periodo_cobro == 1
                    ) and periodo_a_considerar == 5:
                        vencido_item = False
                    elif anno_saldo > anno_actual and periodo_cobro == 1:
                        vencido_item = False

                if vencido_item:
                    return {
                        "success": True,
                        "pending": True,
                    }

            return {
                "success": True,
                "pending": False,
            }

        except Exception as e:
            request.env["ir.logging"].sudo().create(
                {
                    "name": "yaipan_person_controller",
                    "type": "server",
                    "dbname": request.env.cr.dbname,
                    "level": "error",
                    "message": f"Error en controller: {str(e)}",
                    "path": __name__,
                    "func": "yaipan_person",
                    "line": (124),
                }
            )

            return {"success": False, "error": str(e)}

    @http.route(
        "/api/v1/yaipan/persona/pendientes",
        type="json",
        auth="user",
        methods=["POST"],
        csrf=False,
    )
    def yaipan_get_pending(self, **kwargs):

        result = (
            request.env["yaipan_reports.yaipan_api_connection"]
            .sudo()
            .yaipan_get_pending(**kwargs)
        )

        if not result.get("success"):
            return {
                "success": False,
                "error": result.get("result", "Error desconocido"),
            }

        return {
            "success": True,
            "result": result.get("result", [])
        }

    @http.route(
        "/api/v1/yaipan/persona/pagar",
        type="json",
        auth="user",
        methods=["POST"],
        csrf=False,
    )
    def yaipan_set_pending(self, **kwargs):
        result = (
            request.env["yaipan_reports.yaipan_api_connection"]
            .sudo()
            .yaipan_set_pending(**kwargs)
        )

        if not result.get("success"):
            return {
                "success": False,
                "error": result.get("result", "Error desconocido"),
            }

        return {
            "success": True,
            "result": result.get("result", [])
        }

    @http.route(
        "/api/v1/yaipan/persona/get",
        type="json",
        auth="user",
        methods=["POST"],
        csrf=False,
    )
    def yaipan_get_person(self, **kwargs):
        result = (
            request.env["yaipan_reports.yaipan_api_connection"]
            .sudo()
            .yaipan_get_person(**kwargs)
        )

        if not result.get("success"):
            return {
                "success": False,
                "error": result.get("result", "Error desconocido"),
            }

        return {
            "success": True,
            "result": result.get("result", [])
        }
