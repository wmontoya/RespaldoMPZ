from odoo import models, fields


class EventType(models.Model):
    _name = "sev.event_type"
    _description = "Tipo de Evento"

    name = fields.Char(string="Nombre")
    description = fields.Text(string="Descripción")
    events = fields.One2many("sev.event", "event_type_id", string="Eventos")
    classifications = fields.One2many(
        "sev.classification", "event_type_id", string="Clasificaciones"
    )
