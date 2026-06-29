from odoo import models


class WasteWizard(models.TransientModel):
    _name = "waste_control.waste_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de reporte de residuos"
    _report_action_ref = "waste_control.waste_report_action"
