import logging
from odoo import fields, models, api
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)

class Evaluation(models.Model):
    _name = "mm.evaluation"
    _description = "Evaluación"
    _rec_name = "title"

    title = fields.Char(string="Título")
    status = fields.Selection(
        [
            ("active", "Activo"),
            ("inactive", "Inactivo"),
            ("pending", "Pendiente"),
        ],
        default="inactive",
        string="Estado",
    )
    initial_date = fields.Date(string="Fecha Inicial")
    final_date = fields.Date(string="Fecha Final")
    mm_answers = fields.One2many("mm.answer", "evaluation_id", string="Respuestas")
    departments = fields.Many2many(
        "hr.department",
        "mm_evaluation_rel",
        "evaluation_id",
        "department_id",
        string="Departamentos",
    )
    sections = fields.Many2many("mm.section", string="Secciones")
    notification_sent = fields.Boolean(string="Notificación Enviada", default=False)
    closed_notification_sent = fields.Boolean(
        string="Notificación de Cierre Enviada", default=False
    )

    proposed_actions = fields.One2many(
        "mm.proposed_action", "evaluation_id", string="Acciones Propuestas"
    )

    def send_notification_email(self):
        if len(self) != 1:
            raise UserError("¡Atención! Solo puedes enviar notificaciones para una evaluación a la vez. Por favor, selecciona solo una evaluación.")
        try:
            mail_utils = self.env["mail.utils"]
            if hasattr(mail_utils, "send_open_notification_mm"):
                for evaluation in self:
                    mail_utils.send_open_notification_mm(evaluation.id)
                    _logger.info(f"Notificación enviada para la evaluación: {evaluation.title}")
            else:
                _logger.warning("El método send_open_notification_mm no está disponible en mail.utils")
        except Exception as e:
            _logger.error(f"Error al enviar la notificación: {str(e)}")