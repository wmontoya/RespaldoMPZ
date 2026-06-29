# -*- coding: utf-8 -*-

import logging
from datetime import timedelta
from odoo import models, fields, api


_logger = logging.getLogger(__name__)


class User(models.Model):
    _inherit = "res.users"
    department_id = fields.Many2one("hr.department", string="Departamento")


class Department(models.Model):
    _inherit = "hr.department"
    _rec_name = 'name'
    unit_id = fields.Many2one("sci.unit", string="Unidad")
    mm_answers = fields.One2many("mm.answer", "department_id", string="Respuestas")
    users = fields.One2many("res.users", "department_id", string="Usuarios")


class DepartmentEvaluation(models.Model):
    _name = "mm.evaluation.rel"
    _description = "Evaluación del Departamento"

    department_id = fields.Many2one(
        "hr.department", string="Departamento", ondelete="cascade"
    )
    evaluation_id = fields.Many2one(
        "mm.evaluation", string="Evaluación", ondelete="cascade"
    )
    status = fields.Selection(
        [
            ("pending", "Pendiente"),
            ("finished", "Finalizado"),
        ],
        default="pending",
        string="Estado",
    )
    score = fields.Float(string="Puntuación", default=0.0)

    def generate_department_report(self):
        selected_departments_ids = self.ids
        return {
            "type": "ir.actions.act_url",
            "url": "/api/v1/department/download_excel_report?department_ids=" + ','.join(map(str, selected_departments_ids)),
            "target": "new",
        }


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
    notification_sent = fields.Boolean(
        string="Notificación Enviada", default=False)
    closed_notification_sent = fields.Boolean(
        string="Notificación de Cierre Enviada", default=False)

    def _check_evaluation_dates(self):
        cron_user = self.env.ref('mature_model.cron_job_user')
        self = self.with_user(cron_user.id)
        today = fields.Date.context_today(self)
        three_days_after = today + timedelta(days=3)
        one_day_after = today - timedelta(days=1)

        evaluations_closing_soon = self.search([
            ('final_date', '=', three_days_after),
            ('notification_sent', '=', False)
        ])
        for evaluation in evaluations_closing_soon:
            self._send_notification(
                evaluation, 'mature_model.email_template_evaluation_closes_soon')
            evaluation.write({'notification_sent': True})

        evaluations_closed = self.search([
            ('final_date', '=', one_day_after),
            ('closed_notification_sent', '=', False)
        ])
        for evaluation in evaluations_closed:
            self._send_notification(
                evaluation, 'mature_model.email_template_evaluation_closed')
            evaluation.write({'closed_notification_sent': True})

    def _send_notification(self, evaluation, template_id):
        template = self.env.ref(template_id)
        try:
            template.send_mail(evaluation.id, force_send=True)
        except Exception as e:
            _logger.error("Error al enviar el correo para la evaluación {}: {}".format(
                evaluation.id, str(e)))

    @api.model
    def create(self, vals):
        record = super(Evaluation, self).create(vals)
        template = self.env.ref(
            'mature_model.email_template_evaluation_notification')
        default_from_email = self.env['ir.config_parameter'].sudo(
        ).get_param('mail.default.from') or 'noreply@example.com'

        _logger.info(f"Creando evaluación con título: {record.title}")

        for department in record.departments:
            for user in department.users:
                email_values = {
                    'email_to': user.email,
                    'email_from': default_from_email,
                }

                try:
                    email_body = template._render_field(
                        'body_html', [record.id])[record.id]
                    email_subject = template._render_field(
                        'subject', [record.id])[record.id]

                    _logger.info(f"Asunto del correo renderizado: {email_subject}")
                    _logger.info(f"Cuerpo del correo renderizado: {email_body}")

                    email_values.update({
                        'subject': email_subject,
                        'body_html': email_body,
                    })

                    mail = self.env['mail.mail'].create(email_values)
                    mail.send()
                except Exception as e:
                    _logger.error(f"Error al enviar el correo: {str(e)}")

        return record


class Section(models.Model):
    _name = "mm.section"
    _description = "Sección"

    name = fields.Char(string="Nombre")
    description = fields.Text(string="Descripción")
    questions = fields.One2many(
        "mm.question", "section_id", string="Preguntas")


class Question(models.Model):
    _name = "mm.question"
    _description = "Pregunta"
    _rec_name = "title"

    title = fields.Char(string="Título")
    description = fields.Text(string="Descripción")
    section_id = fields.Many2one("mm.section", string="Sección")
    options = fields.One2many("mm.option", "question_id", string="Opciones")


class Option(models.Model):
    _name = "mm.option"
    _description = "Opción"
    _rec_name = "description"

    question_id = fields.Many2one("mm.question", string="Pregunta")
    description = fields.Text(string="Descripción")
    mm_answers = fields.One2many("mm.answer", "option_id", string="Respuestas")
    value = fields.Selection(
        [
            ("1", "1"),
            ("2", "2"),
            ("3", "3"),
            ("4", "4"),
            ("5", "5"),
        ],
        default="1",
        string="Valor",
    )


class Answer(models.Model):
    _name = "mm.answer"
    _description = "Respuesta"
    _rec_name = "option_description"

    department_id = fields.Many2one("hr.department", string="Departamento")
    description = fields.Text(string="Descripción")
    option_id = fields.Many2one("mm.option", string="Opción")
    option_description = fields.Text(
        related="option_id.description", string="Descripción de la Opción", readonly=True
    )
    department_name = fields.Char(
        related="department_id.name", string="Nombre del Departamento", readonly=True
    )
    option_value = fields.Selection(
        related="option_id.value", string="Valor de la Opción", readonly=True
    )
    evaluation_id = fields.Many2one("mm.evaluation", string="Evaluación")
