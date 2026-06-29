from odoo import fields, models


class Option(models.Model):
    _name = "mm.option"
    _description = "Opción"
    _rec_name = "description"

    question_id = fields.Many2one("mm.question", string="Pregunta")
    description = fields.Text(string="Descripción")
    mm_answers = fields.One2many("mm.answer", "option_id", string="Respuestas")
    value = fields.Selection(
        [
            ("1", "1"),
            ("2", "2"),
            ("3", "3"),
            ("4", "4"),
            ("5", "5"),
        ],
        default="1",
        string="Valor",
    )
