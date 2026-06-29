from odoo import models, fields


class PaymentType(models.TransientModel):
    _name = "parking_meters.payment_type"
    _description = "Tipos de pago para infracción"

    type_payment = fields.Selection(
        selection=[
            ("efectivo", "Efectivo"),
            ("tarjeta", "Tarjeta"),
            ("transferencia", "Transferencia"),
            ("cheques", "Cheques"),
        ],
        string="Type",
        store=True,
        default="efectivo",
    )

    authorization = fields.Char(string="Auth")
    currency_id = fields.Many2one("res.currency", string="Moneda", default=lambda self: self.env.ref("base.CRC"))
    amount = fields.Monetary(string="Amount", currency_field="currency_id")
    infraction_id = fields.Many2one("parking_meters.infraction", string="Infracción", ondelete="cascade")
    wizard_id = fields.Many2one("parking_meters.infractions_wizard", string="Infracción", ondelete="cascade")



    
