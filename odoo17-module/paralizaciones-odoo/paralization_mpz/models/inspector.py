from odoo import fields, models, api


class Inspector(models.Model):
    _name = "paralization_mpz.inspector"
    _inherits = {"res.users": "user_id"}
    _description = "Inspectores"
    _rec_name = "name"
    _order = "name"

    user_id = fields.Many2one(
        comodel_name="res.users",
        string="Usuario",
        required=True,
        ondelete="restrict",
        help="Usuario asociado al inspector",
    )

    cedula = fields.Char(
        string="Cédula",
        size=15,
        help="Cédula, máximo 15 caracteres",
    )
    
    boleta_ids = fields.One2many(
        "paralization_mpz.boleta",
        "inspector_id",
        string="Boletas",
    )