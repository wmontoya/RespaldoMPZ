from odoo import models, fields, api

class StatusTransaction(models.Model):
    _name = "online_payments.status_transaction"
    _description = "Status Transaction"
    _rec_name = "description"
    
    id = fields.Integer(string="Id")
    description = fields.Char(string="Description")