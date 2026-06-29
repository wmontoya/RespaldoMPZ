from odoo import models, fields, api


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    oracle_db_user = fields.Char(string="Oracle DB User", config_parameter='yaipan_reports.oracle_db_user')
    oracle_db_password = fields.Char(string="Oracle DB Password", config_parameter='yaipan_reports.oracle_db_password', password=True)
    oracle_db_host = fields.Char(string="Oracle DB Host", config_parameter='yaipan_reports.oracle_db_host')
    oracle_db_port = fields.Char(string="Oracle DB Port", config_parameter='yaipan_reports.oracle_db_port')
    oracle_db_service_name = fields.Char(string="Oracle DB Service Name", config_parameter='yaipan_reports.oracle_db_service_name')
    yaipan_url_base = fields.Char(string="Base URL", config_parameter='yaipan_reports.yaipan_url_base')
    yaipan_token = fields.Char(string="Token", config_parameter='yaipan_reports.yaipan_token', password=True)
