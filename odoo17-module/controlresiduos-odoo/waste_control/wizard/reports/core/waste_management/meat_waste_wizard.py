from odoo import models


class MeatWasteWizard(models.TransientModel):
    _name = "waste_control.meat_waste_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de residuos cárnicos"
    _report_action_ref = "waste_control.meat_waste_report_action"
