from odoo import models, fields


class TipoPared(models.Model):
    _name = 'tipos.pared'
    _description = 'Tipos de Paredes'
    _order = 'name'
    _rec_name = 'desc_pared'

    name = fields.Char('Código', required=True)
    desc_pared = fields.Char('Descripción', required=True)

    def name_get(self):
        result = []
        for record in self:
            name = record.desc_pared or record.name
            result.append((record.id, name))
        return result
