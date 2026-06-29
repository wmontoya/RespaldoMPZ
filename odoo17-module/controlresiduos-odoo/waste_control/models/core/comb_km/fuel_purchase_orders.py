from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from ...utils.date_utils import MONTH_SELECTION


class FuelPurchaseOrders(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.fuel_purchase_orders"
    _description = "Órdenes de compra de combustible"
    _rec_name = "bills_id"
    _order = "date desc"

    date = fields.Date(
        string="Fecha",
        required=True,
        help="Fecha de compra",
    )

    liters = fields.Float(
        string="Litros",
        digits=(10, 3),
        required=True,
        help="Numero de litros comprados",
    )

    amount = fields.Monetary(
        string="Monto",
        currency_field="currency_id",
        required=True,
        help="Monto total pagado por el combustible",
    )

    oc_number = fields.Char(
        string="Número de OC",
        size=10,
        help="Número de confirmación del pedido",
    )
    coupon = fields.Char(
        string="Cupón",
        size=10,
        help="Número de cupón o Boucher utilizado para la compra",
    )

    # * Relation fields *
    bills_id = fields.Many2one(
        comodel_name="waste_control.bills",
        string="Factura",
        required=True,
        help="Referencia a factura",
    )

    applicant_id = fields.Many2one(
        comodel_name="res.partner",
        string="Nombre del solicitante",
        domain="[('is_company', '=', False)]",
        help="Persona que solicitó la compra de combustible",
    )

    historic_vehicles_id = fields.Many2one(
        comodel_name="waste_control.historic_vehicles",
        string="Histórico de vehículo",
        help="Información de vehículo",
    )

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
        index=True,
        store=True,
        readonly=True,
    )
    year = fields.Integer(
        string="Año",
        compute="_compute_year",
        index=True,
        store=True,
        readonly=True,
    )

    # * Functions *
    @api.constrains("year", "liters", "amount")
    def _check_ranges(self):
        for record in self:
            if record.year < 1900 or record.year > 3000:
                raise ValidationError(_("El año debe estar entre 1900 y 3000"))
            if record.liters < 0:
                raise ValidationError(_("Los litros no pueden ser negativos"))
            if record.amount < 0:
                raise ValidationError(_("El monto no puede ser negativo"))

    @api.depends("date")
    def _compute_year(self):
        for record in self:
            record.year = record.date.year if record.date else 0

    @api.depends("date")
    def _compute_month(self):
        for record in self:
            record.month = str(record.date.month) if record.date else False
