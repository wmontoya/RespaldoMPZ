from odoo import models, fields, api
from odoo.exceptions import UserError
import oracledb
import requests

class YaipanConnection(models.Model):
    _name = "online_payments.yaipan_connection"
    _description = "Yaipan Connection"
    _rec_name = "environment"
    
    id = fields.Integer(string="Id", required=True)
    environment = fields.Selection( 
        [
            ('production', 'Production'),
            ('development', 'Development')
        ],
        string="Environment",
        required=True,
        default="development"
    )
    url_base = fields.Char(string="Base URL", size=250, required=True)
    autorization = fields.Char(string="Autorization", size=350, required=True)
    
    @api.model
    def yaipan_person_request(self, type, method, parameters):
        production_record = self.search([('environment', '=', 'production')], limit=1)
        
        if not production_record:
            raise UserError("No production environment configured.")

        base_url = production_record.url_base
        if not base_url:
            raise UserError("Base URL for the production environment is not configured.")

        url = f"{base_url}/v1/yaipay/persona/{method}"
        headers = {
            "Accept": "application/json",
            "Authorization": production_record.autorization
        }
        try:
            if type.upper() == "GET":
                params = dict(item.split(':') for item in parameters.split(';'))
                response = requests.get(url, headers=headers, params=params, timeout=60)
            elif type.upper() == "POST":
                response = requests.post(url, headers=headers, json=parameters, timeout=60)
            else:
                raise UserError(("Unsupported request type: %s") % type)
            
            self.env['ir.logging'].create({
                'name': 'yaipan_person_request',
                'type': 'server',
                'dbname': self.env.cr.dbname,
                'level': 'info',
                'message': f"[{type}] Method: {method}\nParams: {parameters}\nResponse: {response.ok} - {response.text}",
                'path': __name__,
                'func': 'yaipan_person_request',
                'line': 0,
            })
            
            if method == "verificar":
                return str(response.ok)
            return response.text
        except Exception as e:
            self.env['ir.logging'].create({
                'name': 'yaipan_person_request',
                'type': 'server',
                'dbname': self.env.cr.dbname,
                'level': 'error',
                'message': f"ERROR: {str(e)}\n[{type}] Method: {method}\nParams: {parameters}",
                'path': __name__,
                'func': 'yaipan_person_request',
                'line': e.__traceback__.tb_lineno,
            })

    def _get_oracle_connection_params(self):
        Param = self.env["ir.config_parameter"].sudo()
        oracle_user = Param.get_param("yaipan_reports.oracle_db_user")
        oracle_password = Param.get_param("yaipan_reports.oracle_db_password")
        oracle_host = Param.get_param("yaipan_reports.oracle_db_host")
        oracle_port = Param.get_param("yaipan_reports.oracle_db_port")
        oracle_service_name = Param.get_param("yaipan_reports.oracle_db_service_name")

        if not all([oracle_user, oracle_password, oracle_host, oracle_port, oracle_service_name]):
            raise UserError("Faltan parámetros de conexión a Oracle en ir.config_parameter.")

        dsn = f"{oracle_host}:{int(oracle_port)}/{oracle_service_name}"
        return oracle_user, oracle_password, dsn

    @api.model
    def yaipan_final_invoice_request(self):
        query_select = "SELECT PARAM_VALUE FROM mpz_web.SPO_PARAMETERS WHERE PARAM_KEY = 'FINAL_INVOICE' FOR UPDATE"
        query_update = "UPDATE mpz_web.SPO_PARAMETERS SET PARAM_VALUE = :newValue WHERE PARAM_KEY = 'FINAL_INVOICE'"
        oracle_user, oracle_password, dsn = self._get_oracle_connection_params()
        current_value = 0

        try:
            with oracledb.connect(user=oracle_user, password=oracle_password, dsn=dsn) as conn:
                with conn.cursor() as cursor:
                    cursor.execute(query_select)
                    row = cursor.fetchone()

                    if not row:
                        raise UserError("No se encontró el parámetro FINAL_INVOICE en SPO_PARAMETERS.")

                    current_value = int(row[0])
                    new_value = current_value + 1

                    cursor.execute(query_update, {"newValue": str(new_value)})
                    conn.commit()

            self.env['ir.logging'].create({
                'name': 'GET_FINAL_INVOICE',
                'type': 'server',
                'level': 'info',
                'dbname': self.env.cr.dbname,
                'message': f"Valor FINAL_INVOICE leído: {current_value}, actualizado a: {new_value}",
                'path': __name__,
                'func': 'yaipan_final_invoice_request',
                'line': 0,
            })

        except Exception as e:
            self.env['ir.logging'].create({
                'name': 'yaipan_final_invoice_request',
                'type': 'server',
                'dbname': self.env.cr.dbname,
                'level': 'error',
                'message': f"Error al obtener/actualizar FINAL_INVOICE: {str(e)}",
                'path': __name__,
                'func': 'yaipan_final_invoice_request',
                'line': e.__traceback__.tb_lineno if hasattr(e, '__traceback__') else 0,
            })
            raise UserError(f"Error en Oracle: {str(e)}")

        return current_value
