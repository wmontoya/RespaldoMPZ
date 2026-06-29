from odoo import models, fields, api, _
from dateutil.relativedelta import relativedelta
from odoo.exceptions import ValidationError, UserError

class ProposedAction(models.Model):
    _name = "ae.proposed_action"
    _description = "Proposed Action for Self-Assessment"
    _rec_name = "id"

    answer_id = fields.Many2one("ae.answer", string="Answer", required=True)
    question_name_by_answer_id = fields.Text(string="Question", related="answer_id.question_id.title", store=True, readonly=True)
    question_guidance_text = fields.Text(string="Guidance", related="answer_id.question_id.guidance_text_proposed_action", store=True, readonly=True)
    description = fields.Html(string="Description", required=True)
    indicators = fields.Text(string="Indicators", required=True)
    department_id = fields.Many2one("hr.department", string="Department", required=True, default=lambda self: self.env.user.department_id)
    responsible_name = fields.Char(string="Responsible Name", required=True)
    accomplishment_level = fields.Selection(
        [
            ("completed", "Completed"),
            ("partial", "Partial"),
            ("not_done", "Pending"),
        ],
        default="not_done",
        string="Accomplishment Level",
    )
    justification = fields.Html(string="Justification")
    justification_attachments = fields.One2many(
        "ae.attachment", "proposed_action_id", string="Attachments"
    )

    finish_date = fields.Date(string="Action Finish Date", required=True)
    
    # Computed fields for view visibility
    is_survey_submitted = fields.Boolean(
        string="Survey Submitted",
        compute="_compute_is_survey_submitted",
        store=True,
    )
    
    @api.depends('answer_id.survey_answer_id.status')
    def _compute_is_survey_submitted(self):
        for record in self:
            record.is_survey_submitted = (
                record.answer_id and 
                record.answer_id.survey_answer_id and 
                record.answer_id.survey_answer_id.status == 'submitted'
            )
    
    @api.constrains('description')
    def _check_description(self):
        for record in self:
            if not record.description or not record.description.strip():
                raise ValidationError(
                    _('La descripción es obligatoria y no puede estar vacía.')
                )

    @api.constrains('finish_date')
    def _check_finish_date(self):
        for record in self:
            # Ensure both values exist
            if record.finish_date and record.create_date:
                base_date = record.create_date.date()   # datetime → date

                # 1) Must be after the creation date
                if record.finish_date <= base_date:
                    raise ValidationError(
                        _('La fecha de finalización debe ser posterior a la fecha de creación.')
                    )

                # 2) No more than 1 year after the creation date
                if record.finish_date > base_date + relativedelta(years=1):
                    raise ValidationError(
                        _('La fecha de finalización no puede ser superior a un año después de la fecha de creación.')
                    )

    def _check_survey_submitted(self):
        """Check if the parent survey is submitted and raise error if trying to modify"""
        if self.answer_id and self.answer_id.survey_answer_id and self.answer_id.survey_answer_id.status == 'submitted':
            raise UserError("You cannot modify proposed actions for a survey that has already been submitted.")

    def write(self, vals):
        """Override write to prevent modifications when survey is submitted"""
        self._check_survey_submitted()
        return super().write(vals)

    def create(self, vals):
        """Override create to prevent creating proposed actions when survey is submitted"""
        # Check if we're creating a proposed action for a submitted survey
        if vals.get('answer_id'):
            answer = self.env['ae.answer'].browse(vals['answer_id'])
            if answer.survey_answer_id and answer.survey_answer_id.status == 'submitted':
                raise UserError("You cannot create new proposed actions for a survey that has already been submitted.")
        return super().create(vals)

    def unlink(self):
        """Override unlink to prevent deleting proposed actions when survey is submitted"""
        self._check_survey_submitted()
        return super().unlink()
