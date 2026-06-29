from odoo import fields, models, api


class Supervisors(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.supervisors"
    _inherits = {"res.partner": "partner_id"}
    _description = "Supervisores"
    _rec_name = "name"
    _order = "name"

    _sql_constraints = [
        (
            "unique_partner_id",
            "UNIQUE(partner_id)",
            "Un ID de socio solo se puede registrar una vez",
        ),
        (
            "unique_identification_number",
            "UNIQUE(identification_number)",
            "El número de identificación debe ser único",
        ),
    ]

    supervision_area = fields.Char(
        string="Área de supervisión",
    )

    identification_number = fields.Char(
        string="Cedula",
        size=15,
        help="Cedula, máximo 15 caracteres",
    )  # @Unique

    details = fields.Text(
        string="Detalle",
        help="Detalles importantes",
    )

    # * Relation fields *
    partner_id = fields.Many2one(
        comodel_name="res.partner",
        string="Persona",
        required=True,
        ondelete="restrict",
        domain="[('is_company', '=', False)]",
        help="La persona que es el supervisor",
    )  # @Unique

    # * Related fields *
    # name = fields.Char(
    #     related="partner_id.name",
    #     store=True,
    #     readonly=False,
    # )
    function = fields.Char(
        related="partner_id.function",
        store=True,
        readonly=False,
    )
    email = fields.Char(
        related="partner_id.email",
        store=True,
        readonly=False,
        help="Dirección de correo",
    )
    phone = fields.Char(
        related="partner_id.phone",
        store=True,
        readonly=False,
        help="Número de teléfono",
    )
    mobile = fields.Char(
        related="partner_id.mobile",
        store=True,
        readonly=False,
        help="Móvil",
    )
    image_1920 = fields.Binary(
        related="partner_id.image_1920",
        readonly=False,
    )
    category_id = fields.Many2many(
        related="partner_id.category_id",
        readonly=False,
    )

    # * Functions*
    @api.model
    def default_get(self, fields_list):
        defaults = super().default_get(fields_list)
        defaults["is_company"] = False
        return defaults
