from odoo import models


class DistrictsTonnagesWizard(models.TransientModel):
    _name = "waste_control.districts_tonnages_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Districts tonnages wizard"
    _report_action_ref = "waste_control.districts_tonnages_report_action"
