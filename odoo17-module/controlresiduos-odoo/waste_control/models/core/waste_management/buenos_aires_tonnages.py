from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from ...utils.date_utils import MONTH_SELECTION


class BuenosAiresTonnages(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.buenos_aires_tonnages"
    _description = "Tonelajes Buenos Aires"
    _rec_name = "billing_date"
    _order = "billing_date desc"

    # Main fields
    billing_date = fields.Date(
        string="Fecha de factura",
        required=True,
        help="Fecha de facturación",
    )

    tons = fields.Float(
        string="Toneladas",
        digits=(6, 2),
        required=True,
        help="Cantidad en toneladas",
    )

    notes = fields.Text(
        string="Notas",
        help="Notas adicionales o comentarios",
    )

    ticket = fields.Char(
        string="Tiquete",
        size=10,
        help="Número de referencia del tiquete",
    )

    # * Relation fields *
    historic_vehicles_id = fields.Many2one(
        comodel_name="waste_control.historic_vehicles",
        string="Vehículo",
        required=True,
        help="Información de vehículo",
    )

    drivers_id = fields.Many2one(
        comodel_name="res.partner",
        string="Conductor",
        help="Información de conductor",
    )

    # * Computed fields *
    month = fields.Selection(
        selection=MONTH_SELECTION,
        string="Mes",
        compute="_compute_month",
        store=True,
        readonly=True,
    )

    year = fields.Integer(
        string="Año",
        compute="_compute_year",
        store=True,
        readonly=True,
    )

    # * Functions *
    @api.depends("billing_date")
    def _compute_month(self):
        for record in self:
            record.month = (
                str(record.billing_date.month) if record.billing_date else False
            )

    @api.depends("billing_date")
    def _compute_year(self):
        for record in self:
            record.year = record.billing_date.year if record.billing_date else 0

    @api.constrains("tons", "year")
    def _check_ranges(self):
        for record in self:
            if record.tons < 0:
                raise ValidationError(_("Las toneladas no pueden ser negativas"))
            if record.year and (record.year < 1900 or record.year > 3000):
                raise ValidationError(_("El año debe estar entre 1900 y 3000"))
