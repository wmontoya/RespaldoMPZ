from odoo import models, fields, api, _


class RecycleProgram(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.recycle_programs"
    _description = "Programas de reciclaje"
    _rec_name = "name"
    _order = "name"

    _sql_constraints = [
        ("name_unique", "UNIQUE(name)", "El nombre del cantón debe ser único")
    ]

    name = fields.Char(
        string="Nombre programa",
        size=50,
        required=True,
        help="Ingrese el nombre",
    )

    details = fields.Text(
        string="Detalle",
        help="Detalles adicionales del programa de reciclaje",
    )
