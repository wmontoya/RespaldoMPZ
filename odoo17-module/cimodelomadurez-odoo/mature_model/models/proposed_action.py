from odoo import models, fields, api


class ProposedAction(models.Model):
    _name = "mm.proposed_action"
    _description = "Acción Propuesta"

    user_id = fields.Many2one(
        "res.users", string="Usuario", default=lambda self: self.env.uid
    )
    evaluation_id = fields.Many2one("mm.evaluation", string="Evaluacion")
    description = fields.Text(string="Descripción")
    indicators = fields.Text(string="Indicadores")
    responsible_name = fields.Char(string="Nombre del Responsable")
    responsible_email = fields.Char(string="Email del Responsable")
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
    attachment = fields.Binary(string="Archivo Adjunto")
    attachment_name = fields.Char(string="Nombre del Archivo Adjunto")
    attachment_type = fields.Char(string="Tipo MIME del Archivo Adjunto")
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

    @api.model
    def _get_admin_user_email(self):
        cron_user = self.env.ref("mail_utils.cron_job_user", raise_if_not_found=False)
        if cron_user:
            return cron_user.email
        return ""
