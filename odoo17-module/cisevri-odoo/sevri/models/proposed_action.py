from odoo import models, fields, api


class ProposedAction(models.Model):
    _name = "sev.proposed_action"
    _description = "Acción Propuesta"
    _rec_name = "id"

    user_id = fields.Many2one(
        "res.users", string="Usuario", default=lambda self: self.env.uid
    )
    event_id = fields.Many2one("sev.event", string="Evento")
    description = fields.Text(string="Descripción")
    indicators = fields.Text(string="Indicadores")
    responsible_name = fields.Char(
        string="Nombre del Responsable",
        related="user_id.name",
        store=True,
        readonly=False,
    )
    responsible_email = fields.Char(string="Email del Responsable",
        related="user_id.email",
        store=True,
        readonly=False
    )
    accomplishment_level = fields.Selection(
        [
            ("yes", "Sí"),
            ("no", "No"),
            ("partial", "Parcial"),
        ],
        default="no",
        string="Nivel de Cumplimiento",
    )
    observations = fields.Text(string="Observaciones")

    # attachment = fields.Binary(string="Archivo Adjunto")
    # attachment_name = fields.Char(string="Nombre del Archivo Adjunto")
    # attachment_type = fields.Char(string="Tipo MIME del Archivo Adjunto")
    attachments = fields.One2many(
        "sev.attachment", "proposed_action_id", string="Adjuntos"
    )

    justification = fields.Text(string="Justificación")
    action_date = fields.Date(string="Fecha de Acción")
    notification_sent = fields.Boolean(string="Notificación Enviada", default=False)
    expired_notification_sent = fields.Boolean(
        string="Notificación de Vencimiento Enviada", default=False
    )
    admin_user_email = fields.Text(
        string="Email del Administrador",
        default=lambda self: self._get_admin_user_email(),
    )

    def generate_proposedAction_report(self):
        selected_departments_ids = self.ids
        return {
            "type": "ir.actions.act_url",
            "url": "/api/v1/proposedAction/sevri/download_excel_report?actionsIDS="
            + ",".join(map(str, selected_departments_ids)),
            "target": "new",
        }

    def generate_proposedAction_report_PDF(self):
        selected_departments_ids = self.ids
        return {
            "type": "ir.actions.act_url",
            "url": "/api/v1/proposedAction/sevri/download_pdf_report?actionsIDS="
            + ",".join(map(str, selected_departments_ids)),
            "target": "new",
        }

    @api.model
    def _get_admin_user_email(self):
        cron_user = self.env.ref("mail_utils.cron_job_user", raise_if_not_found=False)
        if cron_user:
            return cron_user.email
        return ""
