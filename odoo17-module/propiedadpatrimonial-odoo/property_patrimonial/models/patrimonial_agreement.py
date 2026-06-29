from odoo import models, fields, api
from odoo.exceptions import ValidationError


class PatrimonialAgreement(models.Model):
    _name = "patrimonial.agreement"
    _description = "Patrimonial Agreement"
    _order = "fecha_vencimiento desc"

    name = fields.Char(string="Agreement Number", required=True, tracking=True)

    notes = fields.Text(string="Notes", tracking=True)

    fecha_inicio = fields.Date(string="Start Date", required=True, tracking=True)

    fecha_vencimiento = fields.Date(
        string="Expiration Date", required=True, tracking=True
    )

    file_ids = fields.One2many(
        "patrimonial.agreement.file", "agreement_id", string="Archivos"
    )
    
    property_id = fields.Many2one(
        "patrimonial.property", string="Property", required=True, ondelete="cascade"
    )

    file_summary = fields.Json(
        string="File Summary", compute="_compute_file_summary", store=False
    )

    def _get_estado_label(self, value):
        selection = dict(
            self.env["patrimonial.agreement.file"]._fields["estado"].selection
        )
        return selection.get(value, value)

    @api.depends("file_ids")
    def _compute_file_summary(self):
        for rec in self:
            rec.file_summary = [
                {
                    "id": f.attachment_id.id,
                    "name": f.name or f.attachment_id.name or "archivo_sin_nombre",
                    "estado": f.estado or "desconocido",
                    "estado_display": self._get_estado_label(f.estado),
                }
                for f in rec.file_ids
                if f.attachment_id
            ]

    def action_open_agreement(self):
        self.ensure_one()

        return {
            "type": "ir.actions.act_window",
            "name": "Editar Convenio",
            "res_model": "patrimonial.agreement",
            "view_mode": "form",
            "view_id": self.env.ref(
                "property_patrimonial.view_patrimonial_agreement_form"
            ).id,
            "res_id": self.id,
            "target": "new",
        }

    def action_delete_agreement(self):
        self.unlink()

    def action_download(self):
        attachment_id = self.env.context.get("attachment_id")
        return {
            "type": "ir.actions.act_url",
            "url": f"/web/content/{attachment_id}?download=true",
            "target": "self",
        }
