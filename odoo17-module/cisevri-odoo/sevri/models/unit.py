from odoo import models, fields


class Unit(models.Model):
    _name = "sci.unit"
    _description = "Unit"

    name = fields.Char(string="Nombre")
    description = fields.Text(string="Descripción")
    departments = fields.One2many("hr.department", "unit_id", string="Departamentos")
