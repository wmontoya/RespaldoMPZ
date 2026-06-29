from odoo import models, fields

class Catalog(models.Model):
    _name = "online_payments.catalog"
    _description = "Catalog for payments"

    prefix = fields.Char(string="Prefix", required=True)
    code_agreement = fields.Char(string="Code Agreement")
    code_bank = fields.Char(string="Code Bank")
    code_agency = fields.Char(string="Code Agency")
    identification_default = fields.Char(string="Default Identification")
    have_details = fields.Boolean(string="Have Details", default=False)
    active = fields.Boolean(string="Active", default=True)