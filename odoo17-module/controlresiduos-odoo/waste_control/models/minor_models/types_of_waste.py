from odoo import models, fields, api, _


class TypeOfWaste(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.types_of_waste"
    _description = "Tipos de residuo"
    _rec_name = "name"
    _order = "name"

    _sql_constraints = [
        ("name_unique", "UNIQUE(name)", "El nombre del cantón debe ser único")
    ]

    name = fields.Char(
        string="Nombre tipo de residuo",
        size=50,
        required=True,
        help="Ingrese el nombre",
    )
