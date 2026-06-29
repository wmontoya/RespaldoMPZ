from odoo import models, fields


class TipoPiso(models.Model):
    _name = 'tipos.piso'
    _description = 'Tipos de Pisos'
    _order = 'name'
    _rec_name = 'desc_piso'

    name = fields.Char('Código', required=True)
    desc_piso = fields.Char('Descripción', required=True)

    def name_get(self):
        result = []
        for record in self:
            name = record.desc_piso or record.name
            result.append((record.id, name))
        return result
