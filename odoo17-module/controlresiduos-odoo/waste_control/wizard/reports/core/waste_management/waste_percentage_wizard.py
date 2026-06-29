from odoo import models


class WastePercentageWizard(models.TransientModel):
    _name = "waste_control.waste_percentage_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de porcentaje de residuos"
    _report_action_ref = "waste_control.waste_percentage_report_action"
