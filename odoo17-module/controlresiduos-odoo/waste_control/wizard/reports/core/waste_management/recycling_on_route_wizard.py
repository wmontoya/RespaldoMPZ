from odoo import models


class RecyclingOnRouteWizard(models.TransientModel):
    _name = "waste_control.recycling_on_route_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de reciclaje en ruta"
    _report_action_ref = "waste_control.recycling_on_route_report_action"
