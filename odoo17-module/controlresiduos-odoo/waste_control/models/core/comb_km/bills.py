from odoo import models, fields


class FuelBills(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.bills"
    _description = "Facturas"
    _rec_name = "bill_number"
    _order = "date desc"

    _sql_constraints = [
        (
            "bill_number_unique",
            "UNIQUE(bill_number)",
            "El número de factura debe ser único",
        )
    ]

    bill_number = fields.Char(
        string="Número de factura",
        required=True,
        help="Identificador único o número de referencia para la factura",
    )

    date = fields.Date(
        string="Fecha de factura",
        required=True,
        help="Fecha de emisión de la factura de combustible",
    )

    amount = fields.Monetary(
        currency_field="currency_id",
        string="Monto",
        required=True,
        help="Monto total de la factura de combustible",
    )

    # * Relation fields *
    currency_id = fields.Many2one(
        comodel_name="res.currency",
        string="Moneda",
        default=lambda self: self.env.company.currency_id,
    )

    # * Inverse relations *
    fuel_purchase_orders_ids = fields.One2many(
        comodel_name="waste_control.fuel_purchase_orders",
        inverse_name="bills_id",
        string="Órdenes de compra de combustible",
    )
