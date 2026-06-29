from odoo import models, fields


class TipoTecho(models.Model):
    _name = 'tipos.techo'
    _description = 'Tipos de Techos'
    _order = 'name'
    _rec_name = 'desc_techo'

    name = fields.Char('Código', required=True)
    desc_techo = fields.Char('Descripción', required=True)

    def name_get(self):
        result = []
        for record in self:
            name = record.desc_techo or record.name
            result.append((record.id, name))
        return result
