from odoo import models, fields


class Communities(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.communities"
    _description = "Comunidades"
    _rec_name = "name"

    _sql_constraints = [
        ("name_unique", "UNIQUE(name)", "El nombre del cantón debe ser único")
    ]

    name = fields.Char(
        string="Nombre",
        index=True,
        required=True,
        help="Ingrese el nombre",
    )

    # * Relations *
    districts_id = fields.Many2one(
        comodel_name="waste_control.districts",
        string="Distritos",
        required=True,
        ondelete="restrict",
        help="Información de distritos",
    )
