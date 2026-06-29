from odoo import models, fields, api, _


class Products(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.products"
    _description = "Productos"
    _rec_name = "name"
    _order = "name asc"

    _sql_constraints = [
        ("name_unique", "UNIQUE(name)", "El nombre del cantón debe ser único")
    ]

    name = fields.Char(
        string="Nombre",
        size=100,
        required=True,
        help="Ingrese el nombre",
    )

    details = fields.Text(
        string="Detalle",
        help="Detalles adicionales sobre el producto",
    )

    # * Inverse relations *
