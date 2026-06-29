from odoo import models, fields

class TrashDay(models.Model):
    _name = "trash.day"
    _description = "Day of the Week"

    name = fields.Selection([
        ('monday', 'Lunes'),
        ('tuesday', 'Martes'),
        ('wednesday', 'Miércoles'),
        ('thursday', 'Jueves'),
        ('friday', 'Viernes'),
        ('saturday', 'Sábado'),
        ('sunday', 'Domingo'),
    ], string="Day", required=True, unique=True)

    display_name = fields.Char(
        compute="_compute_display_name",
        store=False,
        string="Display Name"
    )

    def _compute_display_name(self):
        for rec in self:
            rec.display_name = dict(self._fields['name'].selection).get(rec.name)
