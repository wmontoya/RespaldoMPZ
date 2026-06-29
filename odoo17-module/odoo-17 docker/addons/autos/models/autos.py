# -*- coding: utf-8 -*-

from odoo import models, fields, api

class Autos(models.Model):
    _name = 'autos.autos'
    _description = 'Modelo de autos'

    # id = fields.Integer(string="Id")
    # marca = fields.Char(string='Marca')
    # state = fields.Selection([('activo', 'Activo'), ('inactivo', 'Inactivo')], string='Estado del registro')
    # color = fields.Char(string='Color')
    # placa = fields.Char(string='Placa')

    # def action_save(self):
    #     """Saves the current auto record."""
    #     return self.env['autos.autos'].create({
    #     'id':self.id,
    #     'marca': self.marca,
    #     'state': self.state,
    #     'color': self.color,
    #     'placa': self.placa,
    # })

