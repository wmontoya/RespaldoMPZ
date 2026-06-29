from odoo import http, exceptions  # pyright: ignore
from odoo.http import request, Response  # pyright: ignore
from datetime import datetime
import requests  # pyright: ignore
from requests.adapters import HTTPAdapter, Retry
import json
import hashlib
from odoo.exceptions import UserError  # pyright: ignore
import os
from odoo.addons.online_payments.utils import Authentication


class PlaceToPayController(http.Controller):
    @http.route(
        "/api/v1/compute_response/<string:hash>/<string:trans>/<string:date>/<string:response>/<string:auth>/<string:error>/<string:invoiceId>",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def compute_response(self, hash, trans, date, response, auth, error, invoiceId):
        try:
            login = request.env["ir.config_parameter"].sudo().get_param("online_payments.login_pay")
            tran_key = request.env["ir.config_parameter"].sudo().get_param("online_payments.transaction_key_pay")

            auth_config = {"login": login, "tranKey": tran_key}
            auth_config = Authentication(auth_config)
            auth = auth_config.as_dict()
            auth_payload = {
                "auth": {
                    "login": auth["login"],
                    "tranKey": auth["tranKey"],
                    "seed": auth["seed"],
                    "nonce": auth["nonce"],
                }
            }

            # Reintento con requests
            session = requests.Session()
            retries = Retry(total=3, backoff_factor=1, status_forcelist=[502, 503, 504])
            session.mount("https://", HTTPAdapter(max_retries=retries))

            session_url = f"https://checkout.placetopay.com/api/session/{trans}"
            try:
                request_response = session.post(
                    session_url,
                    json=auth_payload,
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )
                request_response.raise_for_status()
            except requests.exceptions.RequestException as net_err:
                
                request.env["ir.logging"].sudo().create({
                    "name": "controller_finish_payment",
                    "type": "server",
                    "dbname": request.env.cr.dbname,
                    "level": "Error",
                    "message": f"Network error while connecting to PlacetoPay: {str(net_err)}",
                    "path": __name__,
                    "func": invoiceId,
                    "line": 48,
                })
                return "Network error while contacting payment gateway"

            hash_signature = self._compute_hash_signature(tran_key, trans, date, response)

            if hash_signature == hash:
                response_data = request_response.json()
                request.env["ir.logging"].sudo().create({
                    "name": "controller_finish_payment",
                    "type": "server",
                    "dbname": request.env.cr.dbname,
                    "level": "Info",
                    "message": f"Hash verified for invoice {invoiceId}.",
                    "path": __name__,
                    "func": invoiceId,
                    "line": 57,
                })
                request.env['online_payments.payment'].sudo().finish_payment(response_data, invoiceId, hash, error)
            else:
                raise UserError("La firma del hash no coincide con los datos proporcionados.")

        except Exception as e:
            request.env["ir.logging"].sudo().create({
                "name": "controller_finish_payment",
                "type": "server",
                "dbname": request.env.cr.dbname,
                "level": "Error",
                "message": f"Error general en compute_response: {str(e)}",
                "path": __name__,
                "func": invoiceId,
                "line": 60,
            })

    @staticmethod
    def _compute_hash_signature(tran_key, trans, date, respons):
        text_original = f"{trans}{respons}{date}{tran_key}".encode("latin1")
        hash1 = hashlib.sha1(text_original).hexdigest()
        return hash1

    @http.route(
        "/api/v1/compute_pending",
        type="json",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def compute_pending(self, **kwargs):
        try:
            return request.env['online_payments.payment'].sudo().check_status_item_id(kwargs.get("item_id"))

        except Exception as e:
            return { 
                    "success": False,
                    "message": "Error al consultar en place to pay.",
                    "error": str(e)
                    }

    @http.route(
        "/api/v1/register_yaipan_list_by_autorization",
        type="json",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def register_yaipan_list_by_autorization(self, **kwargs):
        log_model = request.env["ir.logging"].sudo()

        try:
            log_model.create({
                "name": "yaipan_inicio",
                "type": "server",
                "dbname": request.env.cr.dbname,
                "level": "info",
                "message": f"Request recibido: {kwargs}",
                "path": __name__,
                "func": "register_yaipan_list_by_autorization",
                "line": 0,
            })

            authorizations = kwargs.get("authorizations")

            if not authorizations:
                raise ValueError("No se enviaron autorizaciones")

            auth_list = [auth.strip() for auth in authorizations.split(",") if auth.strip()]

            log_model.create({
                "name": "yaipan_auth_list",
                "type": "server",
                "dbname": request.env.cr.dbname,
                "level": "info",
                "message": f"Autorizaciones procesadas: {auth_list}",
                "path": __name__,
                "func": "register_yaipan_list_by_autorization",
                "line": 0,
            })

            payments = request.env["online_payments.payment"].sudo().search([
                ("authorization", "in", auth_list)
            ])

            log_model.create({
                "name": "yaipan_payments_found",
                "type": "server",
                "dbname": request.env.cr.dbname,
                "level": "info",
                "message": f"Cantidad de pagos encontrados: {len(payments)}",
                "path": __name__,
                "func": "register_yaipan_list_by_autorization",
                "line": 0,
            })

            if not payments:
                raise ValueError("No se encontraron pagos")

            result = []

            for payment in payments:
                try:
                    log_model.create({
                        "name": "yaipan_payment_loop",
                        "type": "server",
                        "level": "info",
                        "dbname": request.env.cr.dbname,
                        "message": f"Procesando payment ID {payment.id} - Auth {payment.authorization}",
                        "path": __name__,
                        "func": "loop",
                        "line": 0,
                    })

                    prefix = payment.invoice_temp[:3] if payment.invoice_temp else ""

                    parameter_payment = request.env["online_payments.catalog"].sudo().search(
                        [("prefix", "=", prefix), ("active", "=", True)],
                        limit=1
                    )

                    if not parameter_payment:
                        raise ValueError(f"No parameter_payment para prefix {prefix}")

                    parameters = {
                        "cedula": "0123456789",
                        "codigoConvenio": parameter_payment.code_agreement,
                        "codigoBanco": parameter_payment.code_bank,
                        "codigoAgencia": parameter_payment.code_agency,
                        "periodo": datetime.now().strftime("%Y%m%d"),
                        "montoTotal": float(payment.total_amount),
                        "numeroFactura": float(payment.invoice_real)
                    }

                    yaipan_connection = request.env["online_payments.yaipan_connection"].sudo()

                    final_response = yaipan_connection.yaipan_person_request(
                        type="GET",
                        method="verificar",
                        parameters="numeroFactura:" + str(payment.invoice_real),
                    )

                    log_model.create({
                        "name": "yaipan_verificar_response",
                        "type": "server",
                        "level": "info",
                        "dbname": request.env.cr.dbname,
                        "message": f"Respuesta verificar factura {payment.invoice_real}: {final_response}",
                        "path": __name__,
                        "func": "verificar",
                        "line": 0,
                    })

                    if final_response == "True":
                        raise ValueError(
                            f"Factura ya existe en Yaipán: {payment.invoice_real}"
                        )

                    if final_response == "False":
                        try:
                            log_model.create({
                                "name": "yaipan_pago_intento",
                                "type": "server",
                                "level": "info",
                                "dbname": request.env.cr.dbname,
                                "message": f"Intentando pago factura {payment.invoice_real}",
                                "path": __name__,
                                "func": "pagar",
                                "line": 0,
                            })

                            yapan_payment = yaipan_connection.yaipan_person_request(
                                type="POST",
                                method="pagar",
                                parameters=parameters
                            )

                            log_model.create({
                                "name": "yaipan_pago_exito",
                                "type": "server",
                                "level": "info",
                                "dbname": request.env.cr.dbname,
                                "message": f"Pago exitoso: {yapan_payment}",
                                "path": __name__,
                                "func": "pagar",
                                "line": 0,
                            })

                            result.append({
                                "authorization": payment.authorization,
                                "status": "success",
                                "response": yapan_payment
                            })

                        except Exception as pay_error:
                            log_model.create({
                                "name": "yaipan_pago_error",
                                "type": "server",
                                "level": "error",
                                "dbname": request.env.cr.dbname,
                                "message": f"Error en pago: {str(pay_error)}",
                                "path": __name__,
                                "func": "pagar",
                                "line": 0,
                            })

                            result.append({
                                "authorization": payment.authorization,
                                "status": "error",
                                "error": str(pay_error)
                            })

                except Exception as e:
                    log_model.create({
                        "name": "yaipan_loop_error",
                        "type": "server",
                        "level": "error",
                        "dbname": request.env.cr.dbname,
                        "message": f"Error en payment {payment.id}: {str(e)}",
                        "path": __name__,
                        "func": "loop",
                        "line": 0,
                    })

                    result.append({
                        "authorization": payment.authorization,
                        "status": "error",
                        "error": str(e)
                    })

            return {
                "success": True,
                "data": result
            }

        except Exception as e:
            log_model.create({
                "name": "yaipan_general_error",
                "type": "server",
                "level": "error",
                "dbname": request.env.cr.dbname,
                "message": f"Error general: {str(e)}",
                "path": __name__,
                "func": "main",
                "line": 0,
            })

            return {
                "success": False,
                "message": "Error procesando la solicitud",
                "error": str(e)
            }
