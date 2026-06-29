from odoo import models, fields


class Department(models.Model):
    _inherit = "hr.department"
    _rec_name = "name"
    unit_id = fields.Many2one("sci.unit", string="Unit")
    users = fields.One2many("res.users", "department_id", string="Users")
    aes_answers = fields.One2many("ae.answer", "department_id", string="Answers")
