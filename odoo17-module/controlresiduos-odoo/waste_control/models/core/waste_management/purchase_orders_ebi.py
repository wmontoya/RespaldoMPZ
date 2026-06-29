from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from ...utils.date_utils import MONTH_SELECTION


class PurchaseOrdersEBI(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.purchase_orders_ebi"
    _description = "Orden de compra EBI"
    _rec_name = "purchase_order"
    _order = "date desc"

    # Main fields
    purchase_order = fields.Char(
        string="Orden de compra",
        size=10,
        required=True,
        help="Numero de referencia de orden de compra",
    )

    date = fields.Date(
        string="Fecha",
        required=True,
        help="Fecha de la compra de combustible",
    )

    tonnages = fields.Float(
        string="Tonelajes",
        digits=(8, 2),
        required=True,
        help="Cantidad en toneladas",
    )

    cost = fields.Monetary(
        string="Costo",
        currency_field="currency_id",
        required=True,
        help="Costo total de la orden de compra",
    )

    calculated_cost = fields.Monetary(
        string="Costo calculado",
        currency_field="currency_id",
        compute="_compute_costs",
        store=True,
        help="Costo calculado en base a tarifa anual * tonelaje",
    )

    payment_difference = fields.Monetary(
        string="Diferencia de pago",
        currency_field="currency_id",
        compute="_compute_costs",
        store=True,
        help="Diferencia entre el coste real y el coste calculado",
    )

    notes = fields.Text(
        string="Notas",
        help="Notas adicionales o comentarios",
    )

    # * Relation fields *
    currency_id = fields.Many2one(
        comodel_name="res.currency",
        string="Moneda",
        default=lambda self: self.env.company.currency_id,
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
    @api.depends("date")
    def _compute_month(self):
        for record in self:
            record.month = str(record.date.month) if record.date else False

    @api.depends("date")
    def _compute_year(self):
        for record in self:
            record.year = record.date.year if record.date else 0

    @api.constrains("tonnages", "cost", "year")
    def _check_ranges(self):
        for record in self:
            if record.tonnages < 0:
                raise ValidationError(_("Los tonelajes no pueden ser negativos"))
            if record.cost < 0:
                raise ValidationError(_("El costo no puede ser negativo"))
            if record.year < 1900 or record.year > 3000:
                raise ValidationError(_("El año debe estar entre 1900 y 3000"))

    @api.depends("tonnages", "year", "cost")
    def _compute_costs(self):
        for record in self:
            # Safe search: model might not be loaded if we are just starting, but assume it is
            tariff_obj = self.env["waste_control.ebi_tariffs"].search(
                [("year", "=", record.year)], limit=1
            )
            tariff = tariff_obj.tariff if tariff_obj else 0.0

            record.calculated_cost = record.tonnages * tariff
            # Difference: Real Payment (cost) - Theoretical Payment (calculated)
            record.payment_difference = record.cost - record.calculated_cost
