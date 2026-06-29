from odoo import models, fields


class Specification(models.Model):
    _name = "sev.specification"
    _description = "Especificación"
    _rec_name = "description"

    events = fields.One2many("sev.event", "event_specification_id", string="Eventos")
    description = fields.Text(string="Descripción")
    classification_id = fields.Many2one("sev.classification", string="Clasificación")
