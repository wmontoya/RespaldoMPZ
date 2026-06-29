from odoo import models, fields, api

class Alumnos(models.Model):
    _name = 'alumnos.alumnos'
    _description = 'Modelo de alumnos'

    id = fields.Integer(string="Id")
    nombre = fields.Char(string='Nombre')
    apellido1 = fields.Char(string='Apellido1')
    apellido2 = fields.Char(string='Apellido2')
    estado = fields.Selection([('activo', 'Activo'), ('inactivo', 'Inactivo')], string='Estado del registro')
    
    @api.model
    def open_record(self):
        return {
            'type': 'ir.actions.act_window',
            'name': 'Alumno',
            'res_model': 'alumnos.alumnos',
            'view_mode': 'form',
            'res_id': self.id,
            'target': 'current',
        }
