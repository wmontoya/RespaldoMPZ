from odoo import models, fields


class PaymentMethod(models.Model):
    _inherit = "waste_control.base_model"
    _name = "waste_control.payment_methods"
    _description = "Métodos de pago"

    _sql_constraints = [
        ("name_unique", "UNIQUE(name)", "El nombre del cantón debe ser único")
    ]

    name = fields.Char(
        string="Nombre",
        size=50,
        required=True,
        help="Ingrese el nombre",
    )
