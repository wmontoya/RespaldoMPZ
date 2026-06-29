from odoo import models, fields


class MainView(models.Model):
    _name = "waste_control.main_view"
    _description = "Bienvenida"

    active = fields.Boolean(string="Activo", default=True)
