from odoo import models, fields, api

class VehicleType(models.Model):
    _name = "parking_meters.vehicle_type"
    _description = "Vehicles Type"
    _rec_name = "description"

    id = fields.Integer(string="Id")
    description = fields.Char(string="Description")
    @api.model
    def create(self, vals):
        res = super(VehicleType, self).create(vals)
        res.update_user_status()
        return res

    def write(self, vals):
        res = super(VehicleType, self).write(vals)
        self.update_user_status()
        return res

    def update_user_status(self):
        modelo_b_records = self.env['res.users'].search([])
        for modelo_b in modelo_b_records:
            modelo_b.updated_status = 'outdated'