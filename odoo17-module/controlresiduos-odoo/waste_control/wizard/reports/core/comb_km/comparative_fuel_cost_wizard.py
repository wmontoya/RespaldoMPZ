from odoo import models


class ComparativeFuelCostWizard(models.TransientModel):
    _name = "waste_control.comparative_fuel_cost_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de costo comparativo de combustible"
    _report_action_ref = "waste_control.comparative_fuel_cost_report_action"
