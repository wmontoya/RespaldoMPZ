from odoo import models, fields, api

class Brand(models.Model):
    _name = "parking_meters.brand"
    _description = "Brands"
    _rec_name = "brand"
    
    id = fields.Integer(string="Id")
    brand = fields.Char(string="Brand")
    @api.model
    def create(self, vals):
        res = super(Brand, self).create(vals)
        res.update_user_status()
        return res

    def write(self, vals):
        res = super(Brand, self).write(vals)
        self.update_user_status()
        return res

    def update_user_status(self):
        modelo_b_records = self.env['res.users'].search([])
        for modelo_b in modelo_b_records:
            modelo_b.updated_status = 'outdated'