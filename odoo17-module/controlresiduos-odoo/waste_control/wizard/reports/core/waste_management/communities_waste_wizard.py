from odoo import models


class CommunitiesWasteWizard(models.TransientModel):
    _name = "waste_control.communities_waste_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Communities waste wizard"
    _report_action_ref = "waste_control.communities_waste_report_action"
