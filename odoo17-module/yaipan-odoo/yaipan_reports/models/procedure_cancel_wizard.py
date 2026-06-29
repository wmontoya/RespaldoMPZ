from odoo import _, fields, models


class YaipanProcedureCancelWizard(models.TransientModel):
    """Asistente para anular un trámite solicitando el motivo.

    Obliga a registrar una observación del porqué de la anulación. El motivo
    se guarda en el trámite (``cancel_reason``) y queda trazado en el chatter.
    """

    _name = "yaipan_reports.procedure_cancel_wizard"
    _description = "Asistente de anulación de trámite"

    request_id = fields.Many2one(
        "yaipan_reports.procedure_request",
        string="Trámite",
        required=True,
        ondelete="cascade",
    )
    reason = fields.Text(
        string="Motivo de la anulación",
        required=True,
    )

    def action_confirm(self):
        self.ensure_one()
        reason = (self.reason or "").strip()
        request = self.request_id
        request.write({"state": "cancelled", "cancel_reason": reason})
        request.message_post(
            body=_("Trámite anulado. Motivo: %s") % reason
        )
        return {"type": "ir.actions.act_window_close"}
