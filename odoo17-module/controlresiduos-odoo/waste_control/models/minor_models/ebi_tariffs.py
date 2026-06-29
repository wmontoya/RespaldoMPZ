from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class EbiTariffs(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.ebi_tariffs"
    _description = "Tarifas EBI"
    _rec_name = "year"
    _order = "year desc"

    _sql_constraints = [
        ("year_unique", "UNIQUE(year)", "La tarifa para este año ya existe")
    ]

    year = fields.Integer(
        string="Año",
        required=True,
        default=lambda self: fields.Date.today().year,
        help="El año de la tarifa",
    )

    tariff = fields.Monetary(
        string="Tarifa",
        currency_field="currency_id",
        required=True,
        help="Tarifa por tonelada para este año",
    )

    # * Relation fields *
    currency_id = fields.Many2one(
        comodel_name="res.currency",
        string="Moneda",
        default=lambda self: self.env.company.currency_id,
        required=True,
    )

    @api.constrains("year", "tariff")
    def _check_ranges(self):
        for record in self:
            if record.year < 1900 or record.year > 3000:
                raise ValidationError(_("El año debe estar entre 1900 y 3000"))
            if record.tariff < 0:
                raise ValidationError(_("La tarifa no puede ser negativa"))
