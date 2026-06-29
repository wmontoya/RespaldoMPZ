from odoo import models, fields

class PatrimonialDistrict(models.Model):
    _name = 'patrimonial.district'
    _description = 'District'
    _order = 'name'

    name = fields.Char(string='Name', required=True)
    active = fields.Boolean(string='Active', default=True)