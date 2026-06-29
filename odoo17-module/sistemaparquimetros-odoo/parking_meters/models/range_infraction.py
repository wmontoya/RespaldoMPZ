from odoo import models, fields, api

class RangeInfraction(models.Model):
    _name = "parking_meters.range_infraction"
    _description = "Rage of Infractions"
    _rec_name = "ticket_number"

    id = fields.Integer(string="Id")
    ticket_number = fields.Integer(string="Ticket Number")
    start_range = fields.Integer(string="Start Range")
    end_range = fields.Integer(string="End Range")
    user_code_id = fields.Many2one("res.users", string="User")
    
    
    @api.model
    def create(self, vals):
        res = super(RangeInfraction, self).create(vals)
        res.update_user_status()
        return res

    def write(self, vals):
        res = super(RangeInfraction, self).write(vals)
        self.update_user_status()
        return res

    def update_user_status(self):
        modelo_b_records = self.env['res.users'].search([])
        for modelo_b in modelo_b_records:
            modelo_b.updated_status = 'outdated'