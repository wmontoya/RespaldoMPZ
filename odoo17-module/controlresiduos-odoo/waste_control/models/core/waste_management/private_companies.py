from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from ...utils.date_utils import MONTH_SELECTION


class PrivateCompanies(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.private_companies"
    _description = "Transacciones de compañía privada"
    _rec_name = "receipt_number"
    _order = "date desc"

    # Main fields
    date = fields.Date(
        string="Fecha",
        required=True,
        help="Fecha de transacción",
    )

    weight_tons = fields.Float(
        string="Peso en toneladas",
        digits=(6, 2),
        required=True,
        help="Requerido",
    )

    ticket_weight = fields.Float(
        string="Peso de tiquete",
        digits=(6, 2),
        help="Peso registrado en el tiquete (en toneladas)",
    )

    receipt_number = fields.Char(
        string="Número de comprobante",
        size=20,
        required=True,
        help="Número de referencia del recibo",
    )

    amount_to_pay = fields.Monetary(
        string="Monto a pagar",
        currency_field="currency_id",
        required=True,
        help="Monto total a pagar",
    )

    amount_paid = fields.Monetary(
        string="Monto pagado",
        currency_field="currency_id",
        help="Monto ya pagado",
    )

    difference = fields.Monetary(
        string="Diferencia",
        currency_field="currency_id",
        compute="_compute_difference",
        store=True,
        help="Diferencia entre el monto a pagar y monto pagado",
    )

    invoice_status = fields.Selection(
        selection=[
            ("pending", "Pendiente"),
            ("partial", "Parcial"),
            ("paid", "Pagado"),
        ],
        string="Estado de facturación",
        compute="_compute_invoice_status",
        store=True,
        help="Estado basado en la diferencia de pago",
    )

    observations = fields.Text(
        string="Observaciones",
        help="Notas adicionales o comentarios",
    )

    # Eliminated field 'unknown' as per finding #14

    # * Relation fields *
    historic_vehicles_id = fields.Many2one(
        comodel_name="waste_control.historic_vehicles",
        string="Vehículo",
        help="Información de vehículo",
    )

    drivers_id = fields.Many2one(
        comodel_name="res.partner",
        string="Conductor",
        help="Información de conductor",
    )

    payment_method_id = fields.Many2one(
        comodel_name="waste_control.payment_methods",
        string="Método de pago",
        help="Método de pago usado",
    )

    currency_id = fields.Many2one(
        comodel_name="res.currency",
        string="Moneda",
        required=True,
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

    @api.depends("amount_to_pay", "amount_paid")
    def _compute_difference(self):
        for record in self:
            record.difference = record.amount_to_pay - (record.amount_paid or 0.0)

    @api.depends("difference", "amount_to_pay", "amount_paid")
    def _compute_invoice_status(self):
        for record in self:
            if not record.amount_paid or record.amount_paid == 0:
                record.invoice_status = "pending"
            elif record.difference > 0:
                record.invoice_status = "partial"
            else:
                record.invoice_status = "paid"

    @api.constrains("weight_tons", "amount_to_pay", "amount_paid", "year")
    def _check_ranges(self):
        for record in self:
            if record.weight_tons < 0:
                raise ValidationError(_("El peso no puede ser negativo"))
            if record.amount_to_pay < 0:
                raise ValidationError(_("El monto a pagar no puede ser negativo"))
            if record.amount_paid and record.amount_paid < 0:
                raise ValidationError(_("El monto pagado no puede ser negativo"))
            if record.year < 1900 or record.year > 3000:
                raise ValidationError(_("El año debe estar entre 1900 y 3000"))
