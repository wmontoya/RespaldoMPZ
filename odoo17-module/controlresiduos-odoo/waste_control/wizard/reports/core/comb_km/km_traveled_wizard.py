from odoo import models


class KmTraveledWizard(models.TransientModel):
    _name = "waste_control.km_traveled_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de Km recorridos"
    _report_action_ref = "waste_control.km_traveled_report_action"
