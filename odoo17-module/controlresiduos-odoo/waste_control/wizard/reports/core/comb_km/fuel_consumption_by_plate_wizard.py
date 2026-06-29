from odoo import models


class FuelConsumptionByPlateWizard(models.TransientModel):
    _name = "waste_control.fuel_consumption_by_plate_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Asistente de consumo de combustible por placa"
    _report_action_ref = "waste_control.fuel_consumption_by_plate_report_action"
