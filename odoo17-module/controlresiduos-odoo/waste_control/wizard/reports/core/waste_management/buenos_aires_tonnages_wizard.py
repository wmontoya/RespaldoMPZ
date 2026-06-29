from odoo import models


class BuenosAiresTonnagesWizard(models.TransientModel):
    _name = "waste_control.buenos_aires_tonnages_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Buenos Aires tonnages wizard"
    _report_action_ref = "waste_control.buenos_aires_tonnages_report_action"
