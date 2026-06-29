from odoo import models, fields, api
from odoo import exceptions
from odoo.exceptions import UserError
from odoo.addons.online_payments.utils import Authentication
import json
from odoo.http import request
from requests.adapters import HTTPAdapter, Retry
import time
import requests
from requests.exceptions import RequestException
from datetime import datetime, timezone, timedelta
from dateutil.parser import parse


class Payment(models.Model):
    _name = "online_payments.payment"
    _description = "Payments"

    id = fields.Integer(string="ID Pay")
    token = fields.Char(string="Token", size=200)
    authorization = fields.Char(string="Authorization", size=20)
    date_creation = fields.Datetime(string="Date Creation", required=True)
    date_pay = fields.Datetime(string="Date Pay")
    discount = fields.Float(string="Discount", default=0.0)
    email = fields.Char(string="Email", size=60, required=True)
    error_reference = fields.Char(string="Error", size=10, default="01")
    identification = fields.Char(string="Identification", size=20, required=True)
    interest = fields.Float(string="Interest", default=0.0, required=True)
    invoice_real = fields.Char(string="Invoice Real", size=50)
    invoice_temp = fields.Char(string="Invoice Temp", size=50, required=True)
    ip_client = fields.Char(string="IP Client", size=129)
    penalty = fields.Float(string="Penalty", default=0.0, required=True)
    phone = fields.Char(string="Phone", size=20, required=True)
    request_id = fields.Char(string="Request ID", size=20)
    status_transaction_id = fields.Many2one(
        "online_payments.status_transaction", string="Status Transaction", default="1"
    )
    cashier_user_id = fields.Many2one("res.users", string="Cashier")
    sub_amount = fields.Float(string="Sub Amount", default=0.0, required=True)
    stamp = fields.Float(string="Stamp", default=0.0, required=True)
    total_amount = fields.Float(string="Total Amount", default=0.0, required=True)

    payment_details_ids = fields.One2many(
        "online_payments.payment_detail", "payment_id", string="Payment Details"
    )
    status_transaction_description = fields.Char(
        string="State", compute="_compute_status_transaction_description", store=False
    )

    cashier_name = fields.Char(
        compute="_compute_cashier_name", string="Nombre del Cajero"
    )

    @api.depends("cashier_user_id")
    def _compute_cashier_name(self):
        for rec in self:
            rec.cashier_name = rec.cashier_user_id.name or ""

    @api.depends("status_transaction_id")
    def _compute_status_transaction_description(self):
        for record in self:
            record.status_transaction_description = (
                record.status_transaction_id.description
                if record.status_transaction_id
                else "N/A"
            )

    @api.model
    def insert_payment(self, values, name, last_name, infraction):
        required_fields = [
            "date_creation",
            "email",
            "identification",
            "interest",
            "invoice_temp",
            "penalty",
            "phone",
            "sub_amount",
            "stamp",
            "total_amount",
        ]

        missing_fields = [field for field in required_fields if field not in values]
        if missing_fields:
            raise exceptions.ValidationError(
                f"Missing required fields for payment: {', '.join(missing_fields)}"
            )

        payment_details = values.get("payment_details_ids", [])
        if not isinstance(payment_details, list):
            raise exceptions.ValidationError(
                "The 'payment_details_ids' field must be a list of dictionaries or tuples."
            )

        details_data = []
        for detail in payment_details:
            if (
                not isinstance(detail, (tuple, list))
                or len(detail) != 3
                or not isinstance(detail[2], dict)
            ):
                raise exceptions.ValidationError(
                    "Each payment detail must be a tuple (0, 0, dictionary) or a valid dictionary."
                )
            details_data.append(detail)

        values["payment_details_ids"] = details_data
        user_id = self.env.uid
        user = self.env["res.users"].browse(user_id)
        values["cashier_user_id"] = user.id
        try:
            payment_record = self.create(values)
            if not payment_record or not payment_record.id:
                raise exceptions.UserError("Failed to create payment record.")
            if payment_record.status_transaction_id.id == 1:
                placetopay_data = {
                    "amount": values["total_amount"],
                    "idNumber": values["identification"],
                    "ipClient": values["ip_client"],
                    "email": values["email"],
                    "phone": values["phone"],
                    "name": name,
                    "last_name": last_name,
                    "temInvoice": values["invoice_temp"],
                    "infraction": str(infraction),
                    "details": details_data[0][2].get("description"),
                }
                session_response = self.create_placetopay_session(**placetopay_data)
                return {
                    "payment_id": values["invoice_temp"],
                    "collector": session_response,
                }
            else:
                return {"payment_id": values["invoice_temp"]}

        except Exception as e:
            self.env["ir.logging"].create(
                {
                    "name": "insert_payment",
                    "type": "server",
                    "dbname": self.env.cr.dbname,
                    "level": "Error",
                    "message": f"Error: {str(e)}",
                    "path": __name__,
                    "func": values["invoice_temp"],
                    "line": 137,
                }
            )

    @api.model
    def check_status(self, tem_invoice):

        try:
            payment = (
                request.env["online_payments.payment"]
                .sudo()
                .search([("invoice_temp", "=", tem_invoice)], limit=1)
            )

            if not payment or not payment.request_id:
                return {
                    "error": "No se encontró un requestId para la factura temporal proporcionada."
                }

            login = (
                request.env["ir.config_parameter"]
                .sudo()
                .get_param("online_payments.login_pay")
            )
            tran_key = (
                request.env["ir.config_parameter"]
                .sudo()
                .get_param("online_payments.transaction_key_pay")
            )

            if not login or not tran_key:
                return {"error": "Login o tranKey no están configurados correctamente."}

            auth_config = self._get_authentication()
            auth = auth_config.as_dict()

            payload = {"auth": auth}

            query_url = (
                f"https://checkout.placetopay.com/api/session/{payment.request_id}"
            )

            session = requests.Session()
            retries = Retry(
                total=3,
                backoff_factor=1,
                status_forcelist=[502, 503, 504],
                allowed_methods=["POST"],
            )
            session.mount("https://", HTTPAdapter(max_retries=retries))

            response = session.post(
                query_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30,
            )
            response.raise_for_status()

            if response.status_code == 200:
                response_data = response.json()
                return {
                    "message": "",
                    "success": True,
                    "data": response_data,
                }
            else:
                return {
                    "success": False,
                    "message": "No se pudo obtener la información de la sesión - "
                    + response.text,
                    "data": "",
                }

        except Exception as e:
            raise UserError(f"Error al procesar la solicitud: {str(e)}")

    @api.model
    def send_email(self, payment, name):
        self.env["notifications_mpz.oracle_email"].send_payment_notification_email(
            payment.email,
            "Municipalidad de Pérez Zeledón - Pago en línea",
            payment,
            name,
        )

    @api.model
    def finish_payment(self, data_payment, tem_invoice, token, error):
        try:
            payment = (
                self.env["online_payments.payment"]
                .sudo()
                .search(
                    [
                        ("invoice_temp", "=", tem_invoice),
                        ("status_transaction_id", "!=", 2),
                    ],
                    limit=1,
                )
            )
            
            prefix = tem_invoice[:3]
            parameter_payment = self.env["online_payments.catalog"].sudo().search(
                [("prefix", "=", prefix), ("active", "=", True)], limit=1
            )
            

            payment_data = payment.read()[0] if payment else {}
            self.env["ir.logging"].create(
                {
                    "name": "finish_payment",
                    "type": "server",
                    "dbname": self.env.cr.dbname,
                    "level": "info",
                    "message": f"Method: Consulta de pagos\nPayment Data: {payment_data}",
                    "path": __name__,
                    "func": tem_invoice,
                    "line": 211,
                }
            )
            if not parameter_payment:
                raise UserError(f"No se encontraron parámetros para el prefijo: {prefix}")
            if not payment:
                raise UserError(
                    f"No se encontró un pago con la factura temporal: {tem_invoice}"
                )

            status_transaction = (
                self.env["online_payments.status_transaction"]
                .sudo()
                .search(
                    [("description", "=", data_payment["status"]["status"])], limit=1
                )
            )

            if not status_transaction:
                raise UserError(
                    f"No se encontró un estado de transacción con la descripción: {data_payment['status']['status']}"
                )

            date_str = data_payment["status"]["date"]
            pay_date = parse(date_str)
            local_dt = pay_date - timedelta(hours=1)

            yaipan_connection = self.env["online_payments.yaipan_connection"].sudo()
            if not payment.invoice_real:
                if status_transaction.description == "APPROVED":
                    current_value_int = yaipan_connection.yaipan_final_invoice_request()
                new_value = (
                    current_value_int + 1
                    if status_transaction.description == "APPROVED"
                    else 0
                )
            else:
                new_value = payment.invoice_real or 0

            payment.sudo().write(
                {
                    "token": token,
                    "request_id": data_payment["requestId"],
                    "status_transaction_id": status_transaction.id,
                    "date_pay": fields.Datetime.to_string(local_dt),
                    "authorization": (
                        data_payment["payment"][0].get("authorization")
                        if data_payment.get("payment")
                        and isinstance(data_payment["payment"], list)
                        and len(data_payment["payment"]) > 0
                        and data_payment["payment"][0].get("authorization")
                        else "000000"
                    ),
                    "error_reference": error,
                    "invoice_real": new_value,
                }
            )

            if status_transaction.description == "APPROVED":
                try:
                    self.env["online_payments.payment_type"].execute_handler(
                        parameter_payment.prefix, payment
                    )
                except Exception as e:
                    self.env["ir.logging"].create(
                        {
                            "name": "finish_payment_handler",
                            "type": "server",
                            "dbname": self.env.cr.dbname,
                            "level": "Error",
                            "message": f"Error ejecutando handler {prefix}: {str(e)}",
                            "path": __name__,
                            "func": tem_invoice,
                            "line": 281,
                        }
                    )
                cedula = parameter_payment.identification_default
                if parameter_payment.identification_default == "0":
                    cedula = payment.identification                      
                    conn = self.env["yaipan_reports.yaipan_api_connection"].sudo()
                    result = conn.yaipan_person_request(
                        "GET", "get", f"cedula:{cedula}"
                    )
                    if not result.get("success"):
                        return {
                            "success": False,
                            "error": result.get("result", "Error desconocido en la cedula"),
                        }
                    
                try:
                    parameters = {
                        "cedula": cedula,
                        "codigoConvenio": parameter_payment.code_agreement,
                        "codigoBanco": parameter_payment.code_bank,
                        "codigoAgencia": parameter_payment.code_agency,
                        "periodo": datetime.now().strftime("%Y%m%d"),
                        "montoTotal": float(payment.total_amount),
                        "numeroFactura": float(new_value)
                    }
                    if parameter_payment.have_details:
                        parameters["transacciones"] = []
                        for detail in data_payment['payments']:
                            parameters["transacciones"].append({
                                "auxiliarContable": detail.get("auxiliarContable", ""),
                                "numeroCuenta": detail.get("numeroCuenta", 0),
                                "tipoTransaccion": detail.get("tipoTransaccion", ""),
                                "numeroDocumento": detail.get("numeroDocumento", ""),
                            })

                    final_response = yaipan_connection.yaipan_person_request(
                        type="GET",
                        method="verificar",
                        parameters="numeroFactura:" + str(new_value),
                    )

                    if final_response == "True":
                        raise ValueError(
                            "Yaipán respondió True al preguntar por la factura:"
                            + str(new_value)
                        )

                    if final_response == "False":
                        yapan_payment = yaipan_connection.yaipan_person_request(
                            type="POST", method="pagar", parameters=parameters
                        )
                    if payment.email:
                        self.send_email(
                            payment,
                            data_payment["request"]["payer"]["name"]
                            + (
                                " " + data_payment["request"]["payer"]["surname"]
                                if data_payment["request"]["payer"]["documentType"] != "CPJ"
                                else ""
                            ),
                        )
                    return yapan_payment
                except Exception as e:
                    self.env["ir.logging"].create(
                        {
                            "name": "finish_payment_yaipan",
                            "type": "server",            
                            "dbname": self.env.cr.dbname,
                            "level": "Error",
                            "message": f"Error: {str(e)}",
                            "path": __name__,
                            "func": tem_invoice,
                            "line": 315,
                        }
                    )

        except Exception as e:
            self.env["ir.logging"].create(
                {
                    "name": "finish_payment_general",
                    "type": "server",
                    "dbname": self.env.cr.dbname,
                    "level": "Error",
                    "message": f"Error: {str(e)}",
                    "path": __name__,
                    "func": tem_invoice,
                    "line": 315,
                }
            )

    @api.model
    def create_placetopay_session(self, **kwargs):
        response = {}
        try:
            amount = float(kwargs.get("amount", 0.0))
            id_number = kwargs.get("idNumber")
            ip_client = kwargs.get("ipClient")
            email = kwargs.get("email")
            phone = kwargs.get("phone")
            name = kwargs.get("name")
            last_name = kwargs.get("last_name")
            tem_invoice = kwargs.get("temInvoice")
            details = kwargs.get("details")

            if not (amount and id_number and email and phone and name and tem_invoice):
                raise ValueError(
                    "Faltan datos obligatorios para procesar la solicitud."
                )

            person = self._create_person(id_number, name, last_name, email, phone)
            auth_config = self._get_authentication()
            auth = auth_config.as_dict()
            base_url = self._get_base_url(tem_invoice)
            payload = self._create_payload(
                auth, person, amount, tem_invoice, base_url, ip_client, details
            )

            response = self._send_request(payload)
            if not response:
                person = {}
                payload = self._create_payload(
                    auth, person, amount, tem_invoice, base_url, ip_client, details
                )
                response = self._send_request(payload)
            
            self.env["ir.logging"].create(
                {
                    "name": "create_placetopay_session",
                    "type": "server",
                    "dbname": self.env.cr.dbname,
                    "level": "Info",
                    "message": f"Response:" + json.dumps(response, indent=2),
                    "path": __name__,
                    "func": tem_invoice,
                    "line": 433,
                }
            )    
                
            if response["status"]["status"] != "FAILED":
                self._update_payment(tem_invoice, response["requestId"])
                return response["processUrl"]
            else:
                raise UserError("Error: Transacción fallida en PlaceToPay.")
        except Exception as e:
            self.env["ir.logging"].create(
                {
                    "name": "create_placetopay_session",
                    "type": "server",
                    "dbname": self.env.cr.dbname,
                    "level": "Error",
                    "message": f"Error: {str(e)} \nResponse:\n"
                    + json.dumps(response, indent=2),
                    "path": __name__,
                    "func": tem_invoice,
                    "line": 451,
                }
            )

    def _create_person(self, id_number, name, last_name, email, phone):
        if not id_number:
            raise ValueError("El número de cédula no puede estar vacío.")

        valor_ced = id_number[0]
        if valor_ced == "3":
            return {
                "document": id_number,
                "documentType": "CPJ",
                "name": name,
                "surname": last_name,
                "email": email,
                "mobile": phone,
            }
        elif valor_ced == "0":
            return {
                "document": id_number[1:],
                "documentType": "CRCPF",
                "name": name,
                "surname": last_name,
                "email": email,
                "mobile": phone,
            }
        else:
            return {
                "document": id_number,
                "documentType": "PPN",
                "name": name,
                "surname": last_name,
                "email": email,
                "mobile": phone,
            }

    def _get_authentication(self):
        login = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_param("online_payments.login_pay")
        )
        tran_key = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_param("online_payments.transaction_key_pay")
        )
        return Authentication({"login": login, "tranKey": tran_key})

    def _get_base_url(self, tem_invoice):
        base_url_record = (
            self.env["online_payments.base_url"]
            .sudo()
            .search([("abbreviation", "=", tem_invoice[:3])], limit=1)
        )
        if not base_url_record:
            raise ValueError(f"No se encontró una URL base para {tem_invoice[:3]}")
        return base_url_record.end_point

    def _create_payload(
        self, auth, person, amount, tem_invoice, base_url, ip_client, details
    ):
        description_data = "Municipalidad Pérez Zeledón"
        if details not in [None, "", False, "None"]:
            description_data = "Municipalidad Pérez Zeledón - " + str(details)
        
        payload = {
            "locale": "es_CR",
            "auth": auth,
            "payment": {
                "reference": tem_invoice,
                "description": description_data,
                "amount": {"currency": "CRC", "total": amount},
            },
            "expiration": auth["expiration"],
            "returnUrl": f"{base_url}",
            "ipAddress": ip_client,
            "userAgent": request.httprequest.user_agent.string,
        }

        if person:
            payload["payer"] = person

        return payload

    def _send_request(self, payload):
        try:
            url = "https://checkout.placetopay.com/api/session"
            response = requests.post(
                url, json=payload, headers={"Content-Type": "application/json"}
            )

            if response.status_code != 200:
                raise UserError(f"Error al conectar con PlaceToPay: {response.text}")
            return response.json()
        except Exception as e:
            self.env["ir.logging"].create(
                {
                    "name": "_send_request_placetopay",
                    "type": "server",
                    "dbname": self.env.cr.dbname,
                    "level": "Error",
                    "message": f"Error: {str(e)}",
                    "path": __name__,
                    "func": payload.get("payment", {}).get("reference", "N/A"),
                    "line": 556,
                }
            )

    def _update_payment(self, tem_invoice, request_id):
        payment = (
            self.env["online_payments.payment"]
            .sudo()
            .search([("invoice_temp", "=", tem_invoice)], limit=1)
        )
        if not payment:
            raise UserError(
                f"No se encontró un pago con la factura temporal: {tem_invoice}"
            )
        payment.sudo().write({"request_id": request_id})

    def start_cron_job(self):
        try:
            status_model = self.env["online_payments.status_transaction"].sudo()

            status_map = {
                "PENDING": status_model.search(
                    [("description", "=", "PENDING")], limit=1
                ),
                "REGISTRED": status_model.search(
                    [("description", "=", "REGISTRED")], limit=1
                ),
            }

            today = fields.Date.today()

            pending_payments = self.env["online_payments.payment"].search(
                [
                    (
                        "date_creation",
                        ">=",
                        datetime.combine(today, datetime.min.time()),
                    ),
                    (
                        "date_creation",
                        "<=",
                        datetime.combine(today, datetime.max.time()),
                    ),
                    (
                        "status_transaction_id",
                        "in",
                        [status_map["PENDING"].id, status_map["REGISTRED"].id],
                    ),
                    ("request_id", "!=", False),("authorization", "=", False), ("invoice_real", "=", False)
                ]
            )

            for payment in pending_payments:
                try:
                    check_status_response = self.check_status(payment.invoice_temp)
                    data_payment = check_status_response["data"]
                    if check_status_response["success"]:
                        self.finish_payment(
                            data_payment, payment.invoice_temp, "N/A", "00"
                        )
                    else:
                        self.finish_payment(
                            data_payment, payment.invoice_temp, "N/A", "01"
                        )

                except Exception as payment_error:
                    self.env["ir.logging"].sudo().create(
                        {
                            "name": "start_cron_job_individual",
                            "type": "server",
                            "dbname": self.env.cr.dbname,
                            "level": "Error",
                            "message": (
                                f"Error processing payment ID {payment.id}, "
                                f"Request ID: {payment.request_id}, "
                                f"Error: {str(payment_error)}"
                            ),
                            "path": __name__,
                            "func": "start_cron_job",
                            "line": 608,
                        }
                    )

        except Exception as e:
            today = fields.Date.today()
            self.env["ir.logging"].sudo().create(
                {
                    "name": "start_cron_job_main",
                    "type": "server",
                    "dbname": self.env.cr.dbname,
                    "level": "Error",
                    "message": f"General Error in start_cron_job: {str(e)}",
                    "path": __name__,
                    "func": today.strftime("%Y-%m-%d %H:%M:%S"),
                    "line": 626,
                }
            )

    @api.model
    def check_status_item_id(self, item_id):

        try:
            payment = (
                request.env["online_payments.payment"]
                .sudo()
                .search([("payment_details_ids.item_id", "=", item_id)], limit=1)
            )

            if not payment or not payment.request_id:
                return {
                    "data": {
                        "status": {
                            "status": "REJECTED"
                        }
                    }
                }

            login = (
                request.env["ir.config_parameter"]
                .sudo()
                .get_param("online_payments.login_pay")
            )
            tran_key = (
                request.env["ir.config_parameter"]
                .sudo()
                .get_param("online_payments.transaction_key_pay")
            )

            if not login or not tran_key:
                return {"error": "Login o tranKey no están configurados correctamente."}

            auth_config = self._get_authentication()
            auth = auth_config.as_dict()

            payload = {"auth": auth}

            query_url = (
                f"https://checkout.placetopay.com/api/session/{payment.request_id}"
            )

            session = requests.Session()
            retries = Retry(
                total=3,
                backoff_factor=1,
                status_forcelist=[502, 503, 504],
                allowed_methods=["POST"],
            )
            session.mount("https://", HTTPAdapter(max_retries=retries))

            response = session.post(
                query_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30,
            )
            response.raise_for_status()

            if response.status_code == 200:
                response_data = response.json()
                return {
                    "message": "",
                    "success": True,
                    "data": response_data,
                }
            else:
                return {
                    "success": False,
                    "message": "No se pudo obtener la información de la sesión - "
                    + response.text,
                    "data": "",
                }

        except Exception as e:
            raise UserError(f"Error al procesar la solicitud: {str(e)}")
