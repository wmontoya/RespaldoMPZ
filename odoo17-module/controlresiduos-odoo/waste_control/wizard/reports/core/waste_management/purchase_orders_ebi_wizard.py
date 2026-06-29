from odoo import models


class PurchaseOrdersEBIWizard(models.TransientModel):
    _name = "waste_control.purchase_orders_ebi_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de órdenes de compra EBI"
    _report_action_ref = "waste_control.purchase_orders_ebi_report_action"
