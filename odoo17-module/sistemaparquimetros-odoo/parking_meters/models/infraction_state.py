from odoo import models, fields, api

class InfractionState(models.Model):
    _name = "parking_meters.infraction_state"
    _description = "Infraction States"
    _rec_name = "description"
    
    id = fields.Integer(string="Id")
    description = fields.Char(string="Description")
    @api.model
    def create(self, vals):
        res = super(InfractionState, self).create(vals)
        res.update_user_status()
        return res

    def write(self, vals):
        res = super(InfractionState, self).write(vals)
        self.update_user_status()
        return res

    def update_user_status(self):
        modelo_b_records = self.env['res.users'].search([])
        for modelo_b in modelo_b_records:
            modelo_b.updated_status = 'outdated'