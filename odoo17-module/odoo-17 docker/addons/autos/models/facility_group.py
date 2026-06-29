# -*- coding: utf-8 -*-

from odoo import models, fields, api
 
class FacilityGroup(models.Model):
    _name = "autos.facility_group"
    _description = "Facility groups"

    id = fields.Integer(string="Id")
    marca = fields.Char(string='Marca')
    state = fields.Selection([('activo', 'Activo'), ('inactivo', 'Inactivo')], string='Estado del registro')
    color = fields.Char(string='Color')
    placa = fields.Char(string='Placa')
    facilities_ids = fields.Integer(string="Ids")
    facilities_count = fields.Integer(string="Facilities Count", compute="_compute_facilities_count")

    @api.depends('facilities_ids')
    def _compute_facilities_count(self):
        for group in self:
            group.facilities_count = len(group.facilities_ids)
  
    def open_record(self):
     return {
            'type': 'ir.actions.act_window',
            'name': 'Form View Facility Group',
            'view_mode': 'form',
            'res_model': 'Autos.facility_group',
            'res_id':self.id,
            'target': 'current'
        }


