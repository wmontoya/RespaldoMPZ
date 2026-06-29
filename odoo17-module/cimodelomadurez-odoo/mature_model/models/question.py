from odoo import fields, models


class Question(models.Model):
    _name = "mm.question"
    _description = "Pregunta"
    _rec_name = "title"

    title = fields.Char(string="Título")
    description = fields.Text(string="Descripción")
    section_id = fields.Many2one("mm.section", string="Sección")
    options = fields.One2many("mm.option", "question_id", string="Opciones")
