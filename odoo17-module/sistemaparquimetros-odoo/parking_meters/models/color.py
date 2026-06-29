from odoo import models, fields, api

class Color(models.Model):
    _name = "parking_meters.color"
    _description = "Colors"
    _rec_name = "color"

    id = fields.Integer(string="Id")
    color = fields.Char(string="Color")
    
    @api.model
    def create(self, vals):
        res = super(Color, self).create(vals)
        res.update_user_status()
        return res

    def write(self, vals):
        res = super(Color, self).write(vals)
        self.update_user_status()
        return res

    def update_user_status(self):
        modelo_b_records = self.env['res.users'].search([])
        for modelo_b in modelo_b_records:
            modelo_b.updated_status = 'outdated'
