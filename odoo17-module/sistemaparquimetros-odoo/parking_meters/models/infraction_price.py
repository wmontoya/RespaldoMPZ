from odoo import models, fields, api

class InfractionPrice(models.Model):
    _name = 'parking_meters.infraction_price'
    _description = 'Prices of infractions'
    _rec_name = "price"
    
    id = fields.Integer(string="Id")
    price = fields.Float(string='Price', default=0.0)
    update_date = fields.Datetime(string='Update Date')
    @api.model
    def create(self, vals):
        res = super(InfractionPrice, self).create(vals)
        res.update_user_status()
        return res

    def write(self, vals):
        res = super(InfractionPrice, self).write(vals)
        self.update_user_status()
        return res

    def update_user_status(self):
        modelo_b_records = self.env['res.users'].search([])
        for modelo_b in modelo_b_records:
            modelo_b.updated_status = 'outdated'
