from odoo import models


class FuelEfficiencyWizard(models.TransientModel):
    _name = "waste_control.fuel_efficiency_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de eficiencia de combustible"
    _report_action_ref = "waste_control.fuel_efficiency_report_action"
