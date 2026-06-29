from odoo import models


class KmPerRouteWizard(models.TransientModel):
    _name = "waste_control.km_per_route_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de Km por ruta"
    _report_action_ref = "waste_control.km_per_route_report_action"
