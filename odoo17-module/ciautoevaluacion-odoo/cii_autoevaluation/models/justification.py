from odoo import models, fields, api, _
from odoo.exceptions import UserError

class Justification(models.Model):
    _name = "ae.justification"
    _description = "Answer Justification"
    _rec_name = "description"
    _order = "create_date desc"
 
    description = fields.Html(
        string="Justification",
        required=True,
        help="Justification text in HTML format"
    )
    
    answer_id = fields.Many2one(
        "ae.answer",
        string="Answer",
        required=True,
        ondelete="cascade",
        help="Answer to which this justification belongs"
    )
    justification_attachments = fields.One2many(
        "ae.attachment",
        "justification_id",
        string="Attachments"
    )
    justification_attachments_count = fields.Integer(
        string="Number of Attachments",
        compute="_compute_justification_attachments_count",
        store=True,
    )
    question_name_by_answer_id = fields.Text(string="Question", related="answer_id.question_id.title", store=True, readonly=True)
    question_guidance_text = fields.Text(string="Guidance", related="answer_id.question_id.guidance_text_justification", store=True, readonly=True)
    
    is_survey_submitted = fields.Boolean(
        string="Survey Submitted",
        compute="_compute_is_survey_submitted",
        store=True,
        help="Indicates if the parent survey has already been submitted"
    )
    
    @api.depends('answer_id.survey_answer_id.status')
    def _compute_is_survey_submitted(self):
        """Compute if the parent survey is submitted"""
        for rec in self:
            rec.is_survey_submitted = (
                rec.answer_id and 
                rec.answer_id.survey_answer_id and 
                rec.answer_id.survey_answer_id.status == 'submitted'
            )
    
    @api.model
    def default_get(self, fields_list):
        """Set default values for the justification"""
        res = super().default_get(fields_list)
        
        # If answer_id is provided in context, get related fields
        if self.env.context.get('default_answer_id'):
            answer = self.env['ae.answer'].browse(self.env.context['default_answer_id'])
           
                
        return res

    @api.depends('justification_attachments')
    def _compute_justification_attachments_count(self):
        """Compute the number of documents"""
        for rec in self:
            rec.justification_attachments_count = len(rec.justification_attachments)

    @api.constrains('answer_id')
    def _check_answer_response(self):
        """Ensure justification is only created for 'si' responses"""
        for rec in self:
            if rec.answer_id and rec.answer_id.response != 'si':
                raise UserError(_("Justifications can only be created for 'Sí' responses."))

    def _check_survey_submitted(self):
        """Check if the parent survey is submitted and raise error if trying to modify"""
        if self.answer_id and self.answer_id.survey_answer_id and self.answer_id.survey_answer_id.status == 'submitted':
            raise UserError("You cannot modify justifications for a survey that has already been submitted.")

    def write(self, vals):
        """Override write to prevent modifications when survey is submitted"""
        # Only check survey submitted if not updating attachments
        if not ('justification_attachments' in vals and len(vals) == 1):
            self._check_survey_submitted()

        return super().write(vals)

    @api.model_create_multi
    def create(self, vals_list):
        """Override create to prevent creating justifications when survey is submitted"""
        for vals in vals_list:
            # Check if we're creating a justification for a submitted survey
            if vals.get('answer_id'):
                answer = self.env['ae.answer'].browse(vals['answer_id'])
                if answer.survey_answer_id and answer.survey_answer_id.status == 'submitted':
                    raise UserError("You cannot create new justifications for a survey that has already been submitted.")

        return super().create(vals_list)

    def unlink(self):
        """Override unlink to prevent deleting justifications when survey is submitted"""
        self._check_survey_submitted()
        return super().unlink()

    def copy(self, default=None):
        """Override copy to handle related fields properly"""
        if default is None:
            default = {}
        
        # Don't copy the answer_id to avoid conflicts
        default['answer_id'] = False
        default['description'] = _("%s (copy)") % self.description
        
        return super().copy(default)

    def action_add_attachment(self):
        """Open attachment form to add a new document"""
        self.ensure_one()
        
        # Check if survey is submitted
        if self.is_survey_submitted:
            raise UserError("You cannot add attachments to a justification for a submitted survey.")
        
        return {
            'name': 'Add Document',
            'type': 'ir.actions.act_window',
            'res_model': 'ae.attachment',
            'view_mode': 'form',
            'view_id': self.env.ref('cii_autoevaluation.view_ae_justification_document_popup_form').id,
            'target': 'new',
            'context': {
                'default_justification_id': self.id,
                'default_name': 'New Document',
            }
        }