from odoo import models, fields, api
import json

class PlateType(models.Model):
    _name = 'parking_meters.plate_type'
    _description = 'Types of Plates'
    _rec_name = "description"

    id = fields.Integer(string="Id")
    description = fields.Char(string='Description')
    @api.model
    def get_plates_with_types(self):
        plate_types = self.search([])
        plate_types_with_details = []

        for plate_type in plate_types:
            plate_details = self.env['parking_meters.plate_detail'].search([('plate_type_code_id', '=', plate_type.id)])
            plate_type_data = {
                'id': plate_type.id,
                'description': plate_type.description,
                'plate_details': [{
                    'id': plate_detail.id,
                    'class_code': plate_detail.class_code,
                    'government_code': plate_detail.government_code,
                } for plate_detail in plate_details]
            }
            plate_types_with_details.append(plate_type_data)
        return json.dumps({"data": plate_types_with_details})
    
    def create(self, vals):
        res = super(PlateType, self).create(vals)
        res.update_user_status()
        return res

    def write(self, vals):
        res = super(PlateType, self).write(vals)
        self.update_user_status()
        return res

    def update_user_status(self):
        modelo_b_records = self.env['res.users'].search([])
        for modelo_b in modelo_b_records:
            modelo_b.updated_status = 'outdated'

