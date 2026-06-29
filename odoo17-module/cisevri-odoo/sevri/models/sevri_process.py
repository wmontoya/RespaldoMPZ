from odoo import models, fields, api
import logging
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)

class SevriProcess(models.Model):
    _name = "sev.process"
    _description = "Proceso"
    _rec_name = "id"
    activities = fields.One2many("sev.activity", "sevri_process_id", string="Actividades")
    initial_date = fields.Date(string="Fecha Inicial")
    final_date = fields.Date(string="Fecha Final")
    status = fields.Selection(
        [
            ("active", "Activo"),
            ("inactive", "Inactivo"),
            ("pending", "Pendiente"),
        ],
        default="inactive",
        string="Estado",
    )
    
    notification_sent = fields.Boolean(string="Notificación Enviada", default=False)
    closed_notification_sent = fields.Boolean(string="Notificación de Cierre Enviada", default=False)
    is_internal_control = fields.Boolean(compute="_compute_is_internal_control")

    def _compute_is_internal_control(self):
        for rec in self:
            rec.is_internal_control = self.env.user.has_group(
                'sevri.res_groups_sev_internal_control'
            )
    
    def get_all_user_emails(self):
        """
        Get all active user emails.
        """
        users = self.env['res.users'].search([('active', '=', True), ('email', '!=', False)])
        emails = users.mapped('email')
        return emails
    
    def send_notification_email(self):
        if len(self) != 1:
            raise UserError("¡Atención! Solo puedes enviar notificaciones para un proceso a la vez. Por favor, selecciona solo un proceso.")
        try:
            mail_utils = self.env["mail.utils"]
            if hasattr(mail_utils, "send_open_notification_sevri"):
                for SevriProcess in self:
                    mail_utils.send_open_notification_sevri(SevriProcess.id)
                    _logger.info(f"Notificación enviada para el proceso: {SevriProcess.status}")
            else:
                _logger.warning("El método send_open_notification_sevri no está disponible en mail.utils")
        except Exception as e:
            _logger.error(f"Error al enviar la notificación: {str(e)}")
    