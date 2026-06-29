from odoo import models, fields


class Provinces(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.provinces"
    _description = "Provincias"
    _rec_name = "name"

    _sql_constraints = [
        ("name_unique", "UNIQUE(name)", "El nombre del cantón debe ser único")
    ]

    name = fields.Char(
        string="Nombre",
        required=True,
        help="Ingrese el nombre",
    )

    # * Inverse relations *
    cantons_ids = fields.One2many(
        comodel_name="waste_control.cantons",
        inverse_name="provinces_id",
        string="Cantones",
    )
