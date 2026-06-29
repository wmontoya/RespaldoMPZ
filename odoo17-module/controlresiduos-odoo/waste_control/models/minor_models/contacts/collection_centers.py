from odoo import models, fields, api


class CollectionCenter(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _inherits = {"res.partner": "partner_id"}
    _name = "waste_control.collection_centers"
    _description = "Centros de acopio"
    _rec_name = "name"
    _order = "name"

    _sql_constraints = [
        (
            "unique_collection_center",
            "UNIQUE(partner_id)",
            "Un centro de recogida solo puede registrarse una vez.",
        )
    ]

    details = fields.Text(
        string="Detalle",
        help="Detalles importantes",
    )

    # * Relation fields *
    partner_id = fields.Many2one(
        comodel_name="res.partner",
        string="Centro de acopio",
        required=True,
        ondelete="restrict",
        domain="[('is_company', '=', True)]",
        help="Información del centro de recolección",
    )  # @Unique

    # * Related fields *
    # name = fields.Char(
    #     related="partner_id.name",
    #     store=True,
    #     readonly=False,
    # )
    # function = fields.Char(
    #     related="partner_id.function",
    #     store=True,
    #     readonly=False,
    # )
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

    # * Inverse relations *

    # * Functions*
    @api.model
    def default_get(self, fields_list):
        defaults = super().default_get(fields_list)
        defaults["is_company"] = True
        defaults["company_type"] = "company"
        return defaults

    # @api.depends("partner_id")
    # def _compute_name(self):
    #     for record in self:
    #         record.name = record.partner_id.name or "Unnamed Collection Center"
