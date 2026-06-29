from odoo import models, fields


class Department(models.Model):
    _inherit = "hr.department"
    _rec_name = "name"
    unit_id = fields.Many2one("sci.unit", string="Unidad")
    mm_answers = fields.One2many("mm.answer", "department_id", string="Respuestas")
    users = fields.One2many("res.users", "department_id", string="Usuarios")
