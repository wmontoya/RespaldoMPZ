from odoo import models, fields


class Cantons(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.cantons"
    _description = "Cantones"
    _rec_name = "name"

    _sql_constraints = [
        ("name_unique", "UNIQUE(name)", "El nombre del cantón debe ser único")
    ]

    name = fields.Char(
        string="Nombre",
        required=True,
        help="Ingrese el nombre",
    )

    # * Relations *
    provinces_id = fields.Many2one(
        comodel_name="waste_control.provinces",
        string="Provincias",
        required=True,
        ondelete="restrict",
        help="Información de provincia",
    )

    # * Inverse relations *
    districts_ids = fields.One2many(
        comodel_name="waste_control.districts",
        inverse_name="cantons_id",
        string="Distritos",
    )
