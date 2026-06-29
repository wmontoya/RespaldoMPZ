from odoo import models, fields, api
from odoo.exceptions import UserError


class SurveyAnswerWizard(models.TransientModel):
    _name = "ae.survey.answer.wizard"
    _description = "Survey Answer Creation Wizard"

    survey_id = fields.Many2one("ae.survey", string="Survey", required=True)
    department_ids = fields.Many2many("hr.department", string="Departments")

    @api.model
    def default_get(self, fields_list):
        """Set default values for the wizard"""
        res = super().default_get(fields_list)
        if self.env.context.get('active_model') == 'ae.survey' and self.env.context.get('active_id'):
            survey = self.env['ae.survey'].browse(self.env.context.get('active_id'))
            res['survey_id'] = survey.id
            res['department_ids'] = [(6, 0, survey.departments.ids)]
        return res

    def action_create_survey_answers(self):
        """Create survey answers for selected departments"""
        if not self.department_ids:
            raise UserError("You must select at least one department.")
        
        created_count = 0
        for department in self.department_ids:
            # Check if survey answer already exists
            existing_answer = self.env['ae.survey.answer'].search([
                ('survey_id', '=', self.survey_id.id),
                ('department_id', '=', department.id)
            ], limit=1)
            
            if not existing_answer:
                self.env['ae.survey.answer'].create({
                    'survey_id': self.survey_id.id,
                    'department_id': department.id,
                    'status': 'draft'
                })
                created_count += 1
        
        if created_count > 0:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Answers Created',
                    'message': f'{created_count} survey answers were created successfully.',
                    'type': 'success',
                }
            }
        else:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'No Changes',
                    'message': 'All survey answers already exist for the selected departments.',
                    'type': 'info',
                }
            } 