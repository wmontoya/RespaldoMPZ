from odoo import models, fields

class Attachment(models.Model):
    _name = "sev.attachment"
    _description = "Adjunto"
    _rec_name = "name"

    name = fields.Char(string="Nombre del Adjunto", required=True)
    attachment = fields.Binary(string="Archivo Adjunto", required=True)
    attachment_type = fields.Char(string="Tipo MIME del Archivo Adjunto")
    description = fields.Text(string="Descripción")

    proposed_action_id = fields.Many2one("sev.proposed_action", string="Acción Propuesta", required=True)
