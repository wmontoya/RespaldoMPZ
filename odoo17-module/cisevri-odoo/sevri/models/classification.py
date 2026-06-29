from odoo import models, fields


class Classification(models.Model):
    _name = "sev.classification"
    _description = "Clasificación"
    _rec_name = "description"

    description = fields.Text(string="Descripción")
    events = fields.One2many("sev.event", "event_classification_id", string="Eventos")
    event_type_id = fields.Many2one("sev.event_type", string="Tipo de Evento")
    specifications = fields.One2many(
        "sev.specification", "classification_id", string="Especificaciones"
    )
