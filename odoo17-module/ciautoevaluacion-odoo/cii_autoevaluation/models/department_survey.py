from odoo import models, fields


class DepartmentSurvey(models.Model):
    _name = "ae.survey.rel"
    _description = "Department Survey"
    _rec_name = "score"
    
    department_id = fields.Many2one(
        "hr.department", string="Department", ondelete="cascade", required=True
    )
    survey_id = fields.Many2one(
        "ae.survey", string="Survey", ondelete="cascade", required=True
    )

    status = fields.Selection(
        [
            ("pending", "Pending"),
            ("finished", "Finished"),
        ],
        default="pending",
        string="Status",
    )
    score = fields.Float(string="Score", default=0.0)

    def generate_department_survey_report(self):
        """Generate Excel report for selected department surveys"""
        selected_departments_ids = self.ids
        return {
            "type": "ir.actions.act_url",
            "url": "/api/v1/department/autoevaluation/download_excel_report?department_ids="
            + ",".join(map(str, selected_departments_ids)),
            "target": "new",
        }

    def action_view_survey_answers(self):
        """Open survey answers for the selected department surveys"""
        survey_answer_ids = []
        for record in self:
            survey_answer = self.env['ae.survey.answer'].search([
                ('survey_id', '=', record.survey_id.id),
                ('department_id', '=', record.department_id.id)
            ], limit=1)
            if survey_answer:
                survey_answer_ids.append(survey_answer.id)
        
        if survey_answer_ids:
            return {
                'type': 'ir.actions.act_window',
                'name': 'Survey Answers',
                'res_model': 'ae.survey.answer',
                'view_mode': 'form,tree',
                'res_id': survey_answer_ids[0] if len(survey_answer_ids) == 1 else False,
                'domain': [('id', 'in', survey_answer_ids)],
                'context': {
                    'default_survey_id': self[0].survey_id.id, 
                    'default_department_id': self[0].department_id.id
                }
            }
        else:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'No Answers',
                    'message': 'No survey answers found for the selected departments.',
                    'type': 'warning',
                }
            }
