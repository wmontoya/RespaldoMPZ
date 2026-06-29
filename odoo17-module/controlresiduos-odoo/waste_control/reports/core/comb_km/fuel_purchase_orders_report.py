from odoo import models, api, _
from ...report_utils import (
    aggregate_by_month,
    get_month_values_list,
    get_report_date,
)


class FuelPurchaseOrdersReport(models.AbstractModel):
    _name = "report.waste_control.fuel_purchase_orders_report"
    _description = "Reporte de órdenes de compra de combustible en el año"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.fuel_purchase_orders_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        # Usar utilidad para agregación mensual
        fields = ["liters", "amount"]
        month_data, annual_total, month_names = aggregate_by_month(
            self.env, "waste_control.fuel_purchase_orders", year, fields
        )

        rows = [
            {
                "name": _("Liters consumed"),
                "values": get_month_values_list(month_data, "liters"),
                "total": annual_total["liters"],
                "type": "float",
            },
            {
                "name": _("Cost"),
                "values": get_month_values_list(month_data, "amount"),
                "total": annual_total["amount"],
                "type": "monetary",
            },
        ]

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.fuel_purchase_orders",
            "selected_year": str(year),
            "month_names": month_names,
            "report_rows": rows,
            "company_currency": self.env.company.currency_id,
            "report_date": get_report_date(),
        }
