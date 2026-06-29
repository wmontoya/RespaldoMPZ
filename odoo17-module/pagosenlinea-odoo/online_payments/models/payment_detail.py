from odoo import models, fields


class PaymentDetails(models.Model):
    _name = "online_payments.payment_detail"
    _description = "Payment Details"

    id = fields.Integer(string="ID Payment Detail", required=True)
    accounting_assistant = fields.Char(string="Accounting Assistant", size=20, required=True )
    standard_code = fields.Char(string="Standard Code", default="")
    description = fields.Char(string="Description", required=True)
    status = fields.Char(string="Status", size=20, required=True)
    cutoff_date = fields.Char(string="Cutoff Date", size=20, required=True)
    item_id = fields.Char(string="Item ID", required=True)
    balance_id = fields.Char(string="Balance ID", size=30, required=True)
    amount = fields.Float(string="Amount", required=True)
    penalty_amount = fields.Float(string="Penalty Amount")
    penalties = fields.Float(string="Penalties")
    account_number = fields.Char(string="Account Number", size=20)
    document_number = fields.Char(string="Document Number")
    period = fields.Char(string="Period", size=10, required=True)
    balance = fields.Float(string="Balance", required=True)
    interest_balance = fields.Float(string="Interest Balance", required=True)
    transaction_type = fields.Selection([
        ('transferencia', 'Transferencia'),
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta'),
        ('cheques', 'Cheques'),
        ('web', 'Web'),
    ], string="Transaction Type", default='web')
    year = fields.Char(string="Year", size=5, required=True)
    authorization = fields.Char(string="Authorization", size=20, default="000000")

    payment_id = fields.Many2one(
        "online_payments.payment", string="Payment Reference", ondelete="cascade"
    )
