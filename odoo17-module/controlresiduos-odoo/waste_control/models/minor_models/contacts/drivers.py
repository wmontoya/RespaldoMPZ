from odoo import models, fields, api


class Drivers(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _inherits = {"res.partner": "partner_id"}
    _name = "waste_control.drivers"
    _description = "Conductores"
    _rec_name = "name"
    _order = "name"

    _sql_constraints = [
        (
            "license_number",
            "UNIQUE(license_number)",
            "El número de licencia debe ser único",
        ),
        (
            "unique_partner_id",
            "UNIQUE(partner_id)",
            "Un partner_id solo se puede registrar una vez",
        ),
    ]

    license_number = fields.Char(
        string="Número de licencia",
        size=15,
        help="Licencia de conductor limitado a 15 caracteres: 1-XXXX-XXXX",
    )  # @Unique
    details = fields.Text(
        string="Detalle",
        help="Detalles importantes",
    )

    # * Relation fields *
    partner_id = fields.Many2one(
        comodel_name="res.partner",
        string="Nombre del conductor",
        required=True,
        ondelete="restrict",
        domain="[('is_company', '=', False)]",
        help="La persona que es el conductor",
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

    # * Inverse relations *
    kilometers_traveled_ids = fields.One2many(
        comodel_name="waste_control.kilometers_traveled",
        inverse_name="drivers_id",
        string="Kilómetrajes recorridos",
    )

    historic_vehicles_ids = fields.One2many(
        comodel_name="waste_control.historic_vehicles",
        inverse_name="drivers_id",
        string="Histórico vehículos",
    )

    # * Functions*
    @api.model
    def default_get(self, fields_list):
        defaults = super().default_get(fields_list)
        defaults["is_company"] = False
        return defaults
