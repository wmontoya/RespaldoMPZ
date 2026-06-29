from odoo import models, fields

class BaseUrl(models.Model):
    _name = "online_payments.base_url"
    _description = "Base Url"
    _rec_name = "abbreviation"

    id = fields.Integer(string="Id")
    abbreviation = fields.Char(string="Abbreviation", size=3, required=True)
    end_point = fields.Char(string="End Point",size=100, required=True)
