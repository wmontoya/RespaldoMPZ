from odoo import models, fields, api
from odoo.exceptions import ValidationError, UserError

class Attachment(models.Model):
    _name = "ae.attachment"
    _description = "Self-Evaluation Attachment"
    _rec_name = "name"

    name = fields.Char(string="Attachment Name")
    attachment = fields.Binary(string="Attachment File", required=True)
    attachment_type = fields.Char(string="Attachment MIME Type")
    description = fields.Text(string="Description")

    proposed_action_id = fields.Many2one("ae.proposed_action", string="Proposed Action") 
    justification_id = fields.Many2one("ae.justification", string="Justification")

    def _check_survey_submitted(self):
        """Check if the parent survey is submitted and raise error if trying to modify"""
        if self.proposed_action_id and self.proposed_action_id.answer_id and self.proposed_action_id.answer_id.survey_answer_id and self.proposed_action_id.answer_id.survey_answer_id.status == 'submitted':
            raise UserError("You cannot modify attachments for a survey that has already been submitted.")
        if self.justification_id and self.justification_id.answer_id and self.justification_id.answer_id.survey_answer_id and self.justification_id.answer_id.survey_answer_id.status == 'submitted':
            raise UserError("You cannot modify attachments for a survey that has already been submitted.")

    def write(self, vals):
        """Override write to prevent modifications when survey is submitted"""
        self._check_survey_submitted()
        return super().write(vals)

    @api.model_create_multi
    def create(self, vals_list):
        """Override create to prevent creating attachments when survey is submitted"""
        # Check if we're creating an attachment for a submitted survey
        for vals in vals_list:
            # Auto-generate name if not provided (especially for justifications)
            if not vals.get('name'):
                if vals.get('description'):
                    # Use description as name (truncated to 50 chars)
                    vals['name'] = vals['description'][:50] if len(vals['description']) > 50 else vals['description']
                else:
                    # Generate default name
                    if vals.get('justification_id'):
                        vals['name'] = 'Documento de Justificación'
                    elif vals.get('proposed_action_id'):
                        vals['name'] = 'Documento de Acción Propuesta'
                    else:
                        vals['name'] = 'Documento'

            if vals.get('proposed_action_id'):
                proposed_action = self.env['ae.proposed_action'].browse(vals['proposed_action_id'])
                if proposed_action.answer_id and proposed_action.answer_id.survey_answer_id and proposed_action.answer_id.survey_answer_id.status == 'submitted':
                    raise UserError("You cannot create new attachments for a survey that has already been submitted.")
            if vals.get('justification_id'):
                justification = self.env['ae.justification'].browse(vals['justification_id'])
                if justification.answer_id and justification.answer_id.survey_answer_id and justification.answer_id.survey_answer_id.status == 'submitted':
                    raise UserError("You cannot create new attachments for a survey that has already been submitted.")
        return super().create(vals_list)

    def unlink(self):
        """Override unlink to prevent deleting attachments when survey is submitted"""
        self._check_survey_submitted()
        return super().unlink()

    @api.constrains('proposed_action_id', 'justification_id')
    def _check_proposed_action_or_justification(self):
        for rec in self:
            if not rec.proposed_action_id and not rec.justification_id:
                raise ValidationError("An attachment must be associated with a proposed action or justification.")

    def action_save_attachment(self):
        """Save the attachment and close the popup"""
        self.ensure_one()
        return {'type': 'ir.actions.act_window_close'}