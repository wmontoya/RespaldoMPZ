from odoo import models


class PrivateCompaniesWizard(models.TransientModel):
    _name = "waste_control.private_companies_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de empresas privadas"
    _report_action_ref = "waste_control.private_companies_report_action"
