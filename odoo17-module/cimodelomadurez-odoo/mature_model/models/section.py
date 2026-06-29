from odoo import fields, models


class Section(models.Model):
    _name = "mm.section"
    _description = "Sección"

    name = fields.Char(string="Nombre")
    description = fields.Text(string="Descripción")
    questions = fields.One2many("mm.question", "section_id", string="Preguntas")
