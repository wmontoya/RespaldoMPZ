from odoo import models, api
from odoo.exceptions import UserError
import requests
from datetime import datetime
import json


class YaipanApiConnection(models.TransientModel):
    _name = "yaipan_reports.yaipan_api_connection"
    _description = "Yaipan Api Connection"

    @api.model
    def yaipan_person_request(self, type, method, parameters):
        base_url = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_param("yaipan_reports.yaipan_url_base")
        )
        token = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_param("yaipan_reports.yaipan_token")
        )

        if not base_url or not token:
            raise UserError("Faltan parámetros de configuración de la API Yaipán.")

        url = f"{base_url}/v1/yaipay/persona/{method}"
        headers = {"Accept": "application/json", "Authorization": f"Token {token}"}
        try:
            if type.upper() == "GET":
                params = dict(item.split(":") for item in parameters.split(";"))
                response = requests.get(url, headers=headers, params=params, timeout=60)
            elif type.upper() == "POST":
                response = requests.post(
                    url, headers=headers, json=parameters, timeout=60
                )
            else:
                raise UserError(("Unsupported request type: %s") % type)

            if method == "verificar":
                return {"success": True, "result": str(response.ok)}
            return {"success": True, "result": json.loads(response.text)}
        except Exception as e:
            self.env["ir.logging"].create(
                {
                    "name": "yaipan_person_request",
                    "type": "server",
                    "dbname": self.env.cr.dbname,
                    "level": "error",
                    "message": f"ERROR: {str(e)}\n[{type}] Method: {method}\nParams: {parameters}",
                    "path": __name__,
                    "func": "yaipan_person_request",
                    "line": e.__traceback__.tb_lineno,
                }
            )

    @api.model
    def yaipan_get_pending(self, **kwargs):
        try:
            estado_param = kwargs.get("estado", "todos").lower()
            cedula = kwargs.get("cedula")
            if not cedula:
                return {
                    "success": False,
                    "error": "Falta el parámetro obligatorio: cédula",
                }

            # === 1. Llamada a la API Yaipan ===
            conn = self.env["yaipan_reports.yaipan_api_connection"].sudo()
            result = conn.yaipan_person_request(
                "GET",
                "saldos",
                f"codigoConvenio:003;cedula:{cedula};numeroPagina:1;longitudPagina:300",
            )

            if not result.get("success"):
                return {
                    "success": False,
                    "error": result.get("result", "Error desconocido"),
                }

            api_result = result.get("result", {})
            if isinstance(api_result, dict) and "error" in api_result:
                if api_result["error"] == "Persona en Cobro Judicial":
                    return {"success": True, "error": api_result["error"]}

            # === 2. Cálculo de periodo actual ===
            now = datetime.now()
            anno_actual, mes_actual = now.year, now.month
            periodo_actual = {
                1: 4,
                2: 1,
                3: 1,
                4: 1,
                5: 2,
                6: 2,
                7: 2,
                8: 3,
                9: 3,
                10: 3,
                11: 4,
                12: 4,
            }[mes_actual]

            # === 3. Mapeo de descripciones ===
            desc_map = {
                "Desc. Bienes Inmuebles": "Bienes Inmuebles",
                "Desc.Mant. Parques y Ornatos": "Mant de Parques y Ornato",
                "Desc.Recolección Basura": "Rec. de Basura",
                "Desc.Limpieza Vías": "Limpieza de Vías",
                "Desc.Licencia Comercial": "Licencia Comercial",
            }

            datos = api_result.get("data", [])
            pendientes = []

            for item in datos:
                # --- Año y periodo ---
                periodo_cobro = int(
                    item.get("periodo") or item.get("periodoCobro") or 0
                )
                anno_cobro = int(item.get("year") or item.get("anio") or 0)
                auxiliar = (item.get("auxiliarContable") or "").upper()

                is_patent = auxiliar in ("PAT", "LIC")
                is_monthly = auxiliar in ("BUS", "MER")
                periodo_ref = mes_actual if is_monthly else periodo_actual
                if is_patent:
                    periodo_ref += 1

                # --- Estado ---
                estado = "pendiente"
                if anno_cobro < anno_actual or (
                    anno_cobro == anno_actual and periodo_cobro < periodo_ref
                ):
                    estado = "vencido"
                elif anno_cobro == anno_actual and periodo_cobro == periodo_ref:
                    estado = "al cobro"

                if is_patent and anno_cobro > anno_actual and periodo_cobro == 1:
                    estado = "al cobro" if periodo_ref == 5 else "pendiente"

                # --- Descuentos ---
                descripcion = (item.get("descripcion") or "").strip()
                if descripcion.startswith("Desc"):
                    estado = "pendiente"
                    item["descripcion"] = desc_map.get(descripcion, descripcion)

                item["estado"] = estado
                pendientes.append(item)

            # === 4. Ajuste de saldos con descuento real (optimizado) ===
            from collections import defaultdict

            grupos = defaultdict(list)
            for d in pendientes:
                key = (
                    d.get("auxiliarContable"),
                    d.get("tipoCobro"),
                    d.get("year"),
                    d.get("numeroCuenta"),
                )
                grupos[key].append(d)

            for grupo in grupos.values():
                if (
                    len(grupo) < 4
                    and float(grupo[0].get("saldo", 0)) >= 0
                    and int(grupo[0].get("year", 0)) == anno_actual
                    and grupo[0].get("auxiliarContable") == "CEM"
                ):
                    pendientes = [
                        d for d in pendientes if float(d.get("saldo", 0)) >= 0
                    ]
                    break

            filtrados = []
            for d in pendientes:
                if estado_param != "todos" and d.get("estado") != estado_param:
                    continue
                filtrados.append(
                    {
                        "codigoServicio": d.get("codigoServicio"),
                        "tipoCobro": d.get("tipoCobro"),
                        "year": d.get("year"),
                        "periodo": d.get("periodo"),
                        "fechaCorte": d.get("fechaCorte"),
                        "monto": d.get("monto"),
                        "saldo": d.get("saldo"),
                        "saldoInteres": d.get("saldoInteres"),
                        "estado": d.get("estado"),
                        "descripcion": d.get("descripcion"),
                        "auxiliarContable": d.get("auxiliarContable"),
                        "numeroCuenta": d.get("numeroCuenta"),
                        "tipoTransaccion": d.get("tipoTransaccion"),
                        "numeroDocumento": d.get("numeroDocumento"),
                        "montoMulta": d.get("montoMulta"),
                        "numeroFinca": d.get("informacionCuenta", {}).get(
                            "numeroFinca"
                        ),
                    }
                )

            return {"success": True, "result": filtrados}

        except Exception as e:
            self.env["ir.logging"].sudo().create(
                {
                    "name": "yaipan_get_pending",
                    "type": "server",
                    "dbname": self.env.cr.dbname,
                    "level": "error",
                    "message": f"Error en yaipan api connection: {e}",
                    "path": __name__,
                    "func": "yaipan_get_pending",
                    "line": 208,
                }
            )
            return {"success": False, "error": str(e)}

    @api.model
    def yaipan_set_pending(self, **kwargs):
        try:
            pendientes = kwargs.get("pendientes", [])

            if not pendientes:
                return {
                    "success": False,
                    "error": "No se recibieron pendientes para procesar."
                }

            sub_amount = sum(float(item.get("monto", 0)) for item in pendientes)
            interest = sum(float(item.get("saldoInteres", 0)) for item in pendientes)
            penalty = sum(float(item.get("montoMulta", 0)) for item in pendientes)

            invoice_number = self.env["ir.sequence"].next_by_code("parking_meters.temporal_invoice_spo")
            if not invoice_number:
                return {
                    "success": False,
                    "error": "No se pudo generar el número de factura temporal. Verifica la secuencia."
                }

            payment_details = []
            for item in pendientes:
                payment_details.append(
                    (0, 0, {
                        "accounting_assistant": item.get("auxiliarContable", ""),
                        "standard_code": f"{item.get('tipoTransaccion', '')}-{item.get('numeroDocumento', '')}",
                        "description": f"{item.get('descripcion', '')} - Finca: {item.get('numeroFinca', '')} - Periodo: {item.get('periodo', '')}",
                        "status": item.get("estado", "pendiente"),
                        "cutoff_date": datetime.now().strftime("%Y-%m-%d"),
                        "item_id": item.get('numeroFinca', ''),
                        "balance_id": item.get("tipoTransaccion", ""),
                        "amount": item.get("monto", 0),
                        "penalty_amount": item.get("montoMulta", 0),
                        "penalties": 0,
                        "account_number": item.get("numeroCuenta", ""),
                        "document_number": item.get("numeroDocumento", ""),
                        "period": item.get("periodo", '0'),
                        "balance": item.get("saldo", 0),
                        "interest_balance": item.get("saldoInteres", 0),
                        "year": item.get("year", '0000'),
                        "authorization": item.get("authorization", "000000"),
                    })
                )

            payment_values = {
                "date_creation": datetime.now(),
                "date_pay": datetime.now(),
                "email": "",
                "identification": kwargs.get("cedula", ""),
                "interest": interest,
                "invoice_temp": invoice_number,
                "ip_client": kwargs.get("ip", ""),
                "penalty": penalty,
                "phone": "",
                "sub_amount": sub_amount,
                "stamp": 0,
                "total_amount": sub_amount + interest,
                "status_transaction_id": kwargs.get("status_transaction_id", 2),
                "authorization": kwargs.get("authorization", "000000"),
                "payment_details_ids": payment_details
            }
            
            try:
                payment = self.env["online_payments.payment"].insert_payment(
                    payment_values, "","", None
                )
                return {"success": True, "result": payment} 
            except Exception as e:
                print(f"Error: {str(e)}")

            return {"success": True, "result": payment_values}

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @api.model
    def yaipan_get_person(self, **kwargs):
        try:
            cedula = kwargs.get("cedula")
            if not cedula:
                return {
                    "success": False,
                    "error": "Falta el parámetro obligatorio: cédula",
                }

            conn = self.env["yaipan_reports.yaipan_api_connection"].sudo()
            result = conn.yaipan_person_request(
                "GET", "get", f"cedula:{cedula}"
            )
            if not result.get("success"):
                return {
                    "success": False,
                    "error": result.get("result", "Error desconocido"),
                }

            api_result = result.get("result", {})
            if isinstance(api_result, dict) and "error" in api_result:
                if api_result.get("error") is None and len(api_result) == 1:
                    return {"success": True, "result": None}
                if "error" in api_result and api_result["error"] is not None:
                    return {"success": False, "error": api_result["error"]}

            return {"success": True, "result": api_result}

        except Exception as e:
            self.env["ir.logging"].sudo().create(
                {
                    "name": "yaipan_get_person",
                    "type": "server",
                    "dbname": self.env.cr.dbname,
                    "level": "error",
                    "message": f"Error en yaipan api connection: {e}",
                    "path": __name__,
                    "func": "yaipan_get_person",
                    "line": 287,
                }
            )
            return {"success": False, "error": str(e)}