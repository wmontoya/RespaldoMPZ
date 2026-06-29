from odoo import models, fields

class FincaUse(models.Model):
     _name = 'patrimonial.finca.use'
     _description = 'Finca Use'
     _order = 'description'
     _rec_name = 'description'

     description = fields.Char(string='Description', required=True)

 