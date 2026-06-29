from odoo import models, fields


class Distrito(models.Model):
    _name = 'paralization_mpz.distrito'
    _description = 'Distritos'
    _order = 'name'
    _rec_name = 'name'

    name = fields.Char('Nombre', required=True)