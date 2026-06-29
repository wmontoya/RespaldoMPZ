from odoo import models, fields


class Department(models.Model):
    _inherit = "hr.department"

    unit_id = fields.Many2one("sci.unit", string="Unidad")
    activities = fields.One2many("sev.activity", "department_id", string="Actividades")
