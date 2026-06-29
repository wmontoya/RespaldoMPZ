from odoo import models


class FuelCostWizard(models.TransientModel):
    _name = "waste_control.fuel_cost_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de costo de combustible"
    _report_action_ref = "waste_control.fuel_cost_report_action"
