from odoo import models, fields, api

class PlateDetail(models.Model):
    _name = 'parking_meters.plate_detail'
    _description = 'Plate Details'
    _rec_name = "id"
    _rec_name = "class_code"

    id = fields.Integer(string="Id")
    class_code = fields.Char(string='Class')
    government_code = fields.Char(string='Government Code')
    plate_type_code_id = fields.Many2one("parking_meters.plate_type", string="Plate Type")
    @api.model
    def create(self, vals):
        res = super(PlateDetail, self).create(vals)
        res.update_user_status()
        return res

    def write(self, vals):
        res = super(PlateDetail, self).write(vals)
        self.update_user_status()
        return res

    def update_user_status(self):
        modelo_b_records = self.env['res.users'].search([])
        for modelo_b in modelo_b_records:
            modelo_b.updated_status = 'outdated'

