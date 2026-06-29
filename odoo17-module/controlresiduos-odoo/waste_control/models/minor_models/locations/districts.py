from odoo import models, fields


class Districts(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.districts"
    _description = "Distritos"
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
    cantons_id = fields.Many2one(
        comodel_name="waste_control.cantons",
        string="Cantones",
        required=True,
        ondelete="restrict",
        help="Información de cantón",
    )

    # * Inverse relations *
    communities_ids = fields.One2many(
        comodel_name="waste_control.communities",
        inverse_name="districts_id",
        string="Comunidades",
    )
