from odoo import models


class FuelPurchaseOrdersYearWizard(models.TransientModel):
    _name = "waste_control.fuel_purchase_orders_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de reporte de órdenes de compra de combustible del año"
    _report_action_ref = "waste_control.fuel_purchase_orders_report_action"
