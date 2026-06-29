from odoo import fields, models


class Answer(models.Model):
    _name = "mm.answer"
    _description = "Respuesta"
    _rec_name = "option_description"

    department_id = fields.Many2one("hr.department", string="Departamento")
    description = fields.Text(string="Descripción")
    option_id = fields.Many2one("mm.option", string="Opción")
    option_description = fields.Text(
        related="option_id.description",
        string="Descripción de la Opción",
        readonly=True,
    )
    department_name = fields.Char(
        related="department_id.name", string="Nombre del Departamento", readonly=True
    )
    option_value = fields.Selection(
        related="option_id.value", string="Valor de la Opción", readonly=True
    )
    evaluation_id = fields.Many2one("mm.evaluation", string="Evaluación")
