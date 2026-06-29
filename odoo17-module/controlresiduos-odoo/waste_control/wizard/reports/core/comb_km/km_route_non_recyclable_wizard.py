from odoo import models


class KmRouteNonRecyclableWizard(models.TransientModel):
    _name = "waste_control.km_route_non_recyclable_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de Km por ruta (no reciclable)"
    _report_action_ref = "waste_control.km_route_non_recyclable_report_action"
