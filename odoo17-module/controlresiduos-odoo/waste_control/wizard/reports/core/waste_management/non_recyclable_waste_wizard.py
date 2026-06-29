from odoo import models


class NonRecyclableWasteWizard(models.TransientModel):
    _name = "waste_control.non_recyclable_waste_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de residuos no reciclables"
    _report_action_ref = "waste_control.non_recyclable_waste_report_action"
