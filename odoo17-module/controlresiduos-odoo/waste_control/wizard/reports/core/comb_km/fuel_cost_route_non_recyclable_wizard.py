from odoo import models


class FuelCostRouteNonRecyclableWizard(models.TransientModel):
    _name = "waste_control.fuel_cost_route_non_recyclable_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de costo de combustible por ruta (no reciclable)"
    _report_action_ref = "waste_control.fuel_cost_route_non_recyclable_report_action"
