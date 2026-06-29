from odoo import models, fields, api, _
from odoo.exceptions import UserError


class SurveyAnswer(models.Model):
    _name = "ae.survey.answer"
    _description = "Department Survey Answer"
    _rec_name = "display_name"

    survey_id = fields.Many2one("ae.survey", string="Survey", required=True, 
                               default=lambda self: self._get_default_survey())
    department_id = fields.Many2one("hr.department", string="Department", required=True,
                                   default=lambda self: self._get_default_department())
    user_id = fields.Many2one("res.users", string="Created by", default=lambda self: self.env.uid)
    current_user_id = fields.Many2one("res.users", string="Current User", compute="_compute_current_user", store=False)
    
    # Computed fields
    display_name = fields.Char(string="Name", compute="_compute_display_name", store=True)
    status = fields.Selection([
        ("draft", "Draft"),
        ("in_progress", "In Progress"), 
        ("submitted", "Submitted")
    ], default="draft", string="Status")
    
    # Related fields for easier access
    survey_title = fields.Char(related="survey_id.title", string="Survey Title", store=True)
    department_name = fields.Char(related="department_id.name", string="Department Name", store=True)
    manager_id = fields.Many2one("hr.employee", related="department_id.manager_id", string="Department Manager", store=True)
    
    # Answer fields
    answers = fields.One2many("ae.answer", "survey_answer_id", string="Answers")
  
    # Computed fields for progress tracking
    total_questions = fields.Integer(string="Total Questions", compute="_compute_progress")
    answered_questions = fields.Integer(string="Answered Questions", compute="_compute_progress")
    progress_percentage = fields.Float(string="Progress (%)", compute="_compute_progress")
    available_questions = fields.Integer(string="Available Questions", compute="_compute_available_questions")
    
    # Justification tracking
    justification_count = fields.Integer(string="Total Justifications", compute="_compute_justification_count", store=True)
    proposed_actions_count = fields.Integer(string="Total Proposed Actions", compute="_compute_proposed_actions_count", store=True)
    
    _sql_constraints = [
        ('unique_survey_department', 'unique(survey_id, department_id)', 
         'A response already exists for this survey and department.')
    ]

    @api.model
    def _get_default_survey(self):  
        """Get the default active survey"""
        active_survey = self.env['ae.survey'].search([
            ('status', '=', 'active')
        ], order='initial_date desc', limit=1)
        return active_survey.id if active_survey else False

    @api.model
    def _get_default_department(self):
        """Get the default department for the current user"""
        current_user = self.env.user
        print("get_default_department:", current_user)
        
        # Try to get department from employee record
        if current_user.employee_id and current_user.employee_id.department_id:
            return current_user.employee_id.department_id.id
        
        # If no employee record or department, try to get from user's groups
        # Look for departments that the user might have access to
        user_departments = self.env['hr.department'].search([
            ('company_id', '=', current_user.company_id.id)
        ], limit=1)
        
        if user_departments:
            return user_departments[0].id
            
        return False

    @api.model
    def default_get(self, fields_list):
        """Set default values for the wizard"""
        res = super().default_get(fields_list)
        
        # If it comes in the context, use it
        if not res.get('survey_id') and self.env.context.get('default_survey_id'):
            res['survey_id'] = self.env.context['default_survey_id']
        elif not res.get('survey_id'):
            res['survey_id'] = self._get_default_survey()
            
        # Validate that the survey is active
        if res.get('survey_id'):
            survey = self.env['ae.survey'].browse(res['survey_id'])
            if survey.status != 'active':
                # If the survey is not active, get the default active survey
                res['survey_id'] = self._get_default_survey()
            
        if not res.get('department_id') and self.env.context.get('default_department_id'):
            res['department_id'] = self.env.context['default_department_id']
        elif not res.get('department_id'):
            res['department_id'] = self._get_default_department()
            
        if not res.get('user_id'):
            res['user_id'] = self.env.uid
            
        return res

    @api.depends('survey_id', 'department_id')
    def _compute_display_name(self):
        for record in self:
            if record.survey_id and record.department_id:
                record.display_name = f"{record.survey_id.title} - {record.department_id.name}"
            else:
                record.display_name = "New Answer"

    def _compute_current_user(self):
        """Compute the current user accessing the record"""
        current_user = self.env.user
        for record in self:
            record.current_user_id = current_user.id

    @api.depends('answers.response', 'answers.justification_count', 'answers.proposed_actions_count', 'answers.justification_id', 'answers.proposed_actions', 'answers.justification_id.description', 'answers.proposed_actions.description')
    def _compute_progress(self):
        for record in self:
            if record.survey_id and record.survey_id.components:
                # Count total questions from all components and sections
                total_questions = 0
                answered_questions = 0
                
                for component in record.survey_id.components:
                    for section in component.sections:
                        total_questions += len(section.questions)
                
                # Count answered questions based on response and required content
                for answer in record.answers:
                    if answer.response == 'no' and answer.proposed_actions_count > 0:
                        answered_questions += 1
                    elif answer.response == 'si' and answer.justification_count > 0:
                        answered_questions += 1
                
                record.total_questions = total_questions
                record.answered_questions = answered_questions
                record.progress_percentage = (answered_questions / total_questions * 100) if total_questions > 0 else 0
            else:
                record.total_questions = 0
                record.answered_questions = 0
                record.progress_percentage = 0

    @api.depends('survey_id')
    def _compute_available_questions(self):
        """Compute the number of available questions in the survey"""
        for record in self:
            if record.survey_id and record.survey_id.components:
                available_questions = 0
                for component in record.survey_id.components:
                    for section in component.sections:
                        available_questions += len(section.questions)
                record.available_questions = available_questions
            else:
                record.available_questions = 0

    @api.depends('answers.justification_id')
    def _compute_justification_count(self):
        """Compute the total number of justifications across all answers"""
        for record in self:
            total_justifications = 0
            for answer in record.answers:
                total_justifications += len(answer.justification_id)
            record.justification_count = total_justifications

    @api.depends('answers.proposed_actions')
    def _compute_proposed_actions_count(self):
        """Compute the total number of proposed actions across all answers"""
        for record in self:
            total_proposed_actions = 0
            for answer in record.answers:
                total_proposed_actions += len(answer.proposed_actions)
            record.proposed_actions_count = total_proposed_actions

    def _clean_empty_answers(self):
        """Remove empty or invalid answers"""
        for record in self:
            if record.answers:
                # Remove answers without question_id or with empty questions
                empty_answers = record.answers.filtered(
                    lambda a: not a.question_id or not a.question_id.title
                )
                if empty_answers:
                    empty_answers.unlink()

    @api.model
    def create(self, vals):
        # If it comes in the context, use it
        if not vals.get('survey_id') and self.env.context.get('default_survey_id'):
            vals['survey_id'] = self.env.context['default_survey_id']
        elif not vals.get('survey_id'):
            vals['survey_id'] = self._get_default_survey()
            
        # Validate that the survey is active
        if vals.get('survey_id'):
            survey = self.env['ae.survey'].browse(vals['survey_id'])
            if survey.status != 'active':
                raise UserError("Survey answers can only be created for active self-evaluations.")
            
        if not vals.get('department_id') and self.env.context.get('default_department_id'):
            vals['department_id'] = self.env.context['default_department_id']
        elif not vals.get('department_id'):
            vals['department_id'] = self._get_default_department()
            
        if not vals.get('user_id'):
            vals['user_id'] = self.env.uid
            
        record = super().create(vals)
        record._create_answers_for_questions()
        record._clean_empty_answers()  # Clean any empty answers
        return record

    @api.onchange('survey_id')
    def _onchange_survey_id(self):
        """When survey changes, refresh the answers (in memory for onchange)"""
        if self.survey_id:
            # Ensure we only load questions for active surveys
            if self.survey_id.status != 'active':
                return {
                    'warning': {
                        'title': 'Survey Not Active',
                        'message': 'Questions can only be loaded for active self-evaluations.'
                    }
                }
            
            # Clear existing answers
            self.answers = [(5, 0, 0)]
            # Create answers in memory for each valid question
            answer_vals = []
            if self.survey_id and self.survey_id.components:
                for component in self.survey_id.components:
                    if component and component.sections:  # Validate component exists and has sections
                        for section in component.sections:
                            if section and section.questions:  # Validate section exists and has questions
                                for question in section.questions:
                                    if question and question.title:  # Validate question exists and has title
                                        answer_vals.append((0, 0, {
                                            'question_id': question.id,
                                            'component_id': component.id,
                                            'department_id': self.department_id.id,
                                            'survey_id': self.survey_id.id,
                                            'response': 'sin_respuesta'
                                        }))
            self.answers = answer_vals

    def _create_answers_for_questions(self):
        """Create answer records for all questions in the survey"""
        for record in self:
            if record.survey_id and record.survey_id.components:
                # Ensure we only load questions for the active survey
                if record.survey_id.status != 'active':
                    raise UserError("Questions can only be loaded for active self-evaluations.")
                
                # Clear existing answers first to avoid duplicates
                record.answers = [(5, 0, 0)]
                
                # Create answers only for valid questions
                for component in record.survey_id.components:
                    if component and component.sections:  # Validate component exists and has sections
                        for section in component.sections:
                            if section and section.questions:  # Validate section exists and has questions
                                for question in section.questions:
                                    if question and question.title:  # Validate question exists and has title
                                        # Create answer only if it doesn't already exist
                                        existing_answer = self.env['ae.answer'].search([
                                            ('survey_answer_id', '=', record.id),
                                            ('question_id', '=', question.id)
                                        ], limit=1)
                                        
                                        if not existing_answer:
                                            self.env['ae.answer'].create({
                                                'survey_answer_id': record.id,
                                                'question_id': question.id,
                                                'component_id': component.id,
                                                'department_id': record.department_id.id,
                                                'survey_id': record.survey_id.id,
                                                'response': 'sin_respuesta'
                                            })

    def action_start_survey(self):
        """Start the survey answering process"""
        self.ensure_one()
        
        # Validate that the survey is active
        if self.survey_id.status != 'active':
            raise UserError("You can only start a survey for active self-evaluations.")
        
        # Ensure answers are created for all questions
        self._create_answers_for_questions()
        self._clean_empty_answers()  # Clean any empty answers
        
        # Change status to in progress
        self.status = 'in_progress'
        
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'ae.survey.answer',
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'current',
            'context': {'form_view_initial_mode': 'edit'}
        }

    def action_submit_survey(self):
        """Submit the survey"""
        self.ensure_one()
        if self.progress_percentage < 100:
            raise UserError("No podrá enviar la encuesta hasta que haya respondido a todas las preguntas.")
        
        self.status = 'submitted'
        
        # Show success message and then refresh the view
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Survey Submitted',
                'message': f'The survey "{self.survey_title}" for the department "{self.department_name}" has been submitted successfully. No more modifications can be made.',
                'type': 'success',
                'sticky': False,
                'next': {
                    'type': 'ir.actions.act_window',
                    'name': 'Survey Submitted',
                    'res_model': 'ae.survey.answer',
                    'res_id': self.id,
                    'view_mode': 'form',
                    'target': 'current',
                    'context': {'form_view_initial_mode': 'readonly'},
                }
            }
        }

    def action_reset_to_draft(self):
        """Reset survey to draft status"""
        self.ensure_one()
        if self.status == 'submitted':
            raise UserError("You can not reset the survey that has been submitted.")
        self.status = 'draft'
        # delete answers related to the survey answer
        # Use sudo() to allow assessee users to delete their own answers when resetting
        if self.answers:
            self.answers.sudo().unlink()
        return True

    def action_recalculate_progress(self):
        """Force recalculation of progress for all survey answers"""
        all_survey_answers = self.env['ae.survey.answer'].search([])
        for survey_answer in all_survey_answers:
            # Force recomputation of progress fields
            survey_answer._compute_progress()
            survey_answer._compute_justification_count()
            survey_answer._compute_proposed_actions_count()
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Progress Recalculated',
                'message': f'The progress has been recalculated for {len(all_survey_answers)} surveys.',
                'type': 'success',
            }
        }
 
    def action_refresh_questions(self):
        """Refresh questions for the current survey"""
        self.ensure_one()
        if self.survey_id:
            # Validate that the survey is active
            if self.survey_id.status != 'active':
                raise UserError("You can only update questions for active self-evaluations.")
            
            # Clear existing answers and create new ones
            self._create_answers_for_questions()
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': 'Questions Updated',
                    'message': f'The questions of the survey "{self.survey_title}" have been updated.',
                    'type': 'success',
                }
            }
        return True

    @api.model
    def get_user_survey_answers(self):
        """Get survey answers for the current user's department"""
        current_user = self.env.user
        department_id = self._get_default_department()
        
        if not department_id:
            return self.env['ae.survey.answer']
        
        return self.search([
            ('department_id', '=', department_id),
            ('survey_id.status', '=', 'active')
        ])

    @api.model
    def debug_user_info(self):
        """Debug method to check user information"""
        current_user = self.env.user
        department_id = self._get_default_department()
        survey_id = self._get_default_survey()
        
        debug_info = {
            'user_id': current_user.id,
            'user_name': current_user.name,
            'employee_id': current_user.employee_id.id if current_user.employee_id else False,
            'employee_department': current_user.employee_id.department_id.name if current_user.employee_id and current_user.employee_id.department_id else False,
            'default_department_id': department_id,
            'default_survey_id': survey_id,
            'active_surveys': self.env['ae.survey'].search([('status', '=', 'active')]).mapped('title'),
            'user_survey_answers': self.search([('user_id', '=', current_user.id)]).mapped('display_name')
        }
        
        return debug_info

    @api.model
    def create_survey_answer_for_user(self):
        """Create a survey answer for the current user's department if it doesn't exist"""
        current_user = self.env.user
        department_id = self._get_default_department()
        survey_id = self._get_default_survey()
        
        if not department_id:
            raise UserError("Could not determine your department. Please verify that your employee profile has a department assigned or contact the administrator.")
        
        if not survey_id:
            raise UserError("There are no active surveys at the moment. Please contact the administrator.")
        
        # Check if survey answer already exists for this department and survey
        # Use sudo() to bypass record rules for this check
        existing_answer = self.sudo().search([
            ('survey_id', '=', survey_id),
            ('department_id', '=', department_id)
        ], limit=1)
        
        if existing_answer:
            # Return the existing answer in form view
            return {
                'type': 'ir.actions.act_window',
                'name': f'Survey Answer - {existing_answer.department_id.name}',
                'res_model': 'ae.survey.answer',
                'res_id': existing_answer.id,
                'view_mode': 'form',
                'target': 'current',
                'context': {'form_view_initial_mode': 'edit'}
            }
        
        # Create new survey answer
        try:
            new_answer = self.create({
                'survey_id': survey_id,
                'department_id': department_id,
                'user_id': current_user.id,
                'status': 'draft'
            })
            
            # Return the new answer in form view
            return {
                'type': 'ir.actions.act_window',
                'name': f'New Survey Answer - {new_answer.department_id.name}',
                'res_model': 'ae.survey.answer',
                'res_id': new_answer.id,
                'view_mode': 'form',
                'target': 'current',
                'context': {'form_view_initial_mode': 'edit'}
            }
        except Exception as e:
            # If creation fails due to unique constraint, try to find the existing record again
            existing_answer = self.sudo().search([
                ('survey_id', '=', survey_id),
                ('department_id', '=', department_id)
            ], limit=1)
            
            if existing_answer:
                # Return the existing answer
                return {
                    'type': 'ir.actions.act_window',
                    'name': f'Survey Answer - {existing_answer.department_id.name}',
                    'res_model': 'ae.survey.answer',
                    'res_id': existing_answer.id,
                    'view_mode': 'form',
                    'target': 'current',
                    'context': {'form_view_initial_mode': 'edit'}
                }
            else:
                # Re-raise the original error
                raise e

    def write(self, vals):
        """Override write to validate survey status"""
        # Check if any survey answer is in submitted status
        for record in self:
            if record.status == 'submitted':
                # Allow only specific fields to be modified when submitted
                allowed_fields = ['name', 'display_name']  # Add any other fields that should be allowed
                restricted_fields = [field for field in vals.keys() if field not in allowed_fields]
                if restricted_fields:
                    raise UserError("You can not modify a survey that has been submitted. Once submitted, the survey can not be modified.")
        
        # If survey_id is being changed, validate it's active
        if 'survey_id' in vals:
            survey = self.env['ae.survey'].browse(vals['survey_id'])
            if survey.status != 'active':
                raise UserError("Only active self-evaluations can be assigned.")
        
        result = super().write(vals)
        
        # If survey_id was changed, refresh questions
        if 'survey_id' in vals:
            for record in self:
                record._create_answers_for_questions()
        
        return result

    def action_view_justifications(self):
        """View all justifications for this survey answer"""
        self.ensure_one()
        
        # Get all justifications from answers in this survey
        justification_ids = []
        for answer in self.answers:
            justification_ids.extend(answer.justification_id.ids)
        
        return {
            'type': 'ir.actions.act_window',
            'name': 'Justifications of the Survey',
            'res_model': 'ae.justification',
            'view_mode': 'tree,form,kanban',
            'domain': [('id', 'in', justification_ids)],
            'context': {
                'default_survey_id': self.survey_id.id,
                'default_department_id': self.department_id.id,
            }
        }

    def get_justification_summary(self):
        """Get a summary of justifications for this survey answer"""
        self.ensure_one()
        
        summary = {
            'total_justifications': 0,
            'justifications_by_component': {},
            'justifications_by_question': {}
        }
        
        for answer in self.answers:
            if answer.justification_id:
                summary['total_justifications'] += len(answer.justification_id)
                
                # Group by component
                component_name = answer.component_id.title if answer.component_id else 'Sin Componente'
                if component_name not in summary['justifications_by_component']:
                    summary['justifications_by_component'][component_name] = 0
                summary['justifications_by_component'][component_name] += len(answer.justification_id)
                
                # Group by question
                question_name = answer.question_id.title if answer.question_id else 'Sin Pregunta'
                if question_name not in summary['justifications_by_question']:
                    summary['justifications_by_question'][question_name] = 0
                summary['justifications_by_question'][question_name] += len(answer.justification_id)
        
        return summary

    def action_submit_survey_with_refresh(self):
        """Submit the survey and refresh the view immediately"""
        self.ensure_one()
        if self.progress_percentage < 100:
            raise UserError("No podrá enviar la encuesta hasta que haya respondido a todas las preguntas.")
        
        self.status = 'submitted'
        
        # Return action to refresh the view immediately
        return {
            'type': 'ir.actions.act_window',
            'name': 'Survey Submitted',
            'res_model': 'ae.survey.answer',
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'current',
            'context': {'form_view_initial_mode': 'readonly'},
        }

    def action_generate_html_report(self):
        """Show the self-evaluation report in an HTML page"""
        self.ensure_one()
        url = f"/autoevaluation/survey_answer/html/{self.id}"
        return {
            'type': 'ir.actions.act_url',
            'url': url,
            'target': 'new',
        }

    def generate_pdf_report(self):
        """Generate PDF report for the completed survey answer"""
        self.ensure_one()

        # Only allow PDF generation for submitted surveys for regular users
        # AUTOEVALUATION users can generate PDFs for any survey they have access to
        autoevaluation_groups = [
            'group_autoevaluation_admin',
            'group_autoevaluation_assessee',
            'group_autoevaluation_audit',
            'group_autoevaluation_internal_control'
        ]

        is_autoevaluation_user = any(self.env.user.has_group(f'cii_autoevaluation.{group}') for group in autoevaluation_groups)

        if self.status != 'submitted' and not is_autoevaluation_user:
            raise UserError("El reporte PDF solo está disponible para encuestas que han sido enviadas.")

        try:
            # Generate PDF using Odoo's report engine
            report = self.env.ref('cii_autoevaluation.action_survey_answer_pdf_report')
            pdf_content, _ = report._render_qweb_pdf([self.id])

            # Create download URL
            url = f"/autoevaluation/survey_answer/download_report/{self.id}"

            return {
                'type': 'ir.actions.act_url',
                'url': url,
                'target': 'new',
            }

        except Exception as e:
            raise UserError(f"No se pudo generar el reporte PDF: {str(e)}")

    def action_download_pdf_report(self):
        """Alternative method to download PDF report"""
        self.ensure_one()

        # Same logic as above
        autoevaluation_groups = [
            'group_autoevaluation_admin',
            'group_autoevaluation_assessee',
            'group_autoevaluation_audit',
            'group_autoevaluation_internal_control'
        ]

        is_autoevaluation_user = any(self.env.user.has_group(f'cii_autoevaluation.{group}') for group in autoevaluation_groups)

        if self.status != 'submitted' and not is_autoevaluation_user:
            raise UserError("El reporte PDF solo está disponible para encuestas que han sido enviadas.")

        # Create direct download URL
        download_url = f"/autoevaluation/survey_answer/download_report/{self.id}"

        return {
            'type': 'ir.actions.act_url',
            'url': download_url,
            'target': 'self',  # Open in same window to trigger download
        }

    def _get_answers_by_component(self):
        """Get answers organized by component and section for the report"""
        self.ensure_one()
        
        result = []
        
        # Get all components from the survey
        if self.survey_id and self.survey_id.components:
            for component in self.survey_id.components.sorted('sequence'):
                component_data = {
                    'component': component,
                    'sections': []
                }
                
                # Get sections for this component
                if component.sections:
                    for section in component.sections.sorted('sequence'):
                        section_data = {
                            'section': section,
                            'answers': []
                        }
                        
                        # Get answers for this section
                        answers = self.answers.filtered(
                            lambda a: a.section_id == section
                        ).sorted(
                            lambda a: a.question_id.sequence if a.question_id else 999
                        )
                        
                        section_data['answers'] = answers
                        component_data['sections'].append(section_data)
                
                result.append(component_data)
        else:
            # Fallback: organize by existing answers
            if self.answers:
                # Group answers by component
                components_dict = {}
                for answer in self.answers:
                    component = answer.component_id
                    if component not in components_dict:
                        components_dict[component] = {'component': component, 'sections': []}
                    
                    section = answer.section_id
                    section_found = False
                    for existing_section in components_dict[component]['sections']:
                        if existing_section['section'] == section:
                            existing_section['answers'].append(answer)
                            section_found = True
                            break
                    
                    if not section_found:
                        components_dict[component]['sections'].append({
                            'section': section,
                            'answers': [answer]
                        })
                
                result = list(components_dict.values())
        
        return result
    
    def action_print_report(self):
        """Print the report using browser print functionality"""
        self.ensure_one()
        
        return {
            'type': 'ir.actions.client',
            'tag': 'print_report',
            'params': {
                'title': f'Self-Evaluation Report - {self.display_name}',
            }
        }
    
    def action_close_report(self):
        """Close the report view"""
        return {
            'type': 'ir.actions.act_window_close'
        }

    def action_print_browser(self):
        """Print using browser print functionality"""
        self.ensure_one()
        
        return {
            'type': 'ir.actions.client',
            'tag': 'print_report',
            'params': {
                'title': f'Self-Evaluation Report - {self.display_name}',
            }
        }

    def action_close_print(self):
        """Close the print view"""
        return {
            'type': 'ir.actions.act_window_close'
        }

    def _force_progress_update(self):
        """Force update of progress fields"""
        self.ensure_one()
        self._compute_progress()
        self._compute_justification_count()
        self._compute_proposed_actions_count()

    def action_open_my_previous_assessments(self):
        """Open previous assessments for the current user's department"""
        department_id = self._get_default_department()

        if not department_id:
            return {
                'warning': {
                    'title': 'Sin Departamento',
                    'message': 'No está asignado a ningún departamento.'
                }
            }

        return {
            'type': 'ir.actions.act_window',
            'name': 'Mis Evaluaciones Anteriores',
            'res_model': 'ae.survey.answer',
            'view_mode': 'tree,form',
            'view_ids': [(5, 0, 0),
                (0, 0, {'view_mode': 'tree', 'view_id': self.env.ref('cii_autoevaluation.autoevaluation_survey_answer_user_tree').id}),
                (0, 0, {'view_mode': 'form', 'view_id': self.env.ref('cii_autoevaluation.autoevaluation_survey_answer_form').id})],
            'search_view_id': self.env.ref('cii_autoevaluation.autoevaluation_survey_answer_user_search').id,
            'domain': [('department_id', '=', department_id), ('status', '=', 'submitted')],
            'context': {
                'default_user_id': self.env.uid,
                'default_department_id': department_id,
            },
            'target': 'current',
        }

    @api.model
    def redirect_assessee_to_assessments(self):
        """Redirect assessee users to their assessments when they try to access restricted areas"""
        # Check if user is in assessee group
        if not self.env.user.has_group('cii_autoevaluation.group_autoevaluation_assessee'):
            return False

        # First try to redirect to active assessments
        department_id = self._get_default_department()
        if department_id:
            # Check for active survey answers
            active_answers = self.search([
                ('department_id', '=', department_id),
                ('survey_id.status', '=', 'active'),
                ('status', 'in', ['draft', 'in_progress'])
            ], limit=1)

            if active_answers:
                # Redirect to active assessment
                return {
                    'type': 'ir.actions.act_window',
                    'name': 'Mi Respuesta de Autoevaluación',
                    'res_model': 'ae.survey.answer',
                    'res_id': active_answers[0].id,
                    'view_mode': 'form',
                    'view_id': self.env.ref('cii_autoevaluation.autoevaluation_survey_answer_form').id,
                    'target': 'current',
                }
            else:
                # No active assessments, redirect to previous assessments
                return self.action_open_my_previous_assessments()

        # Fallback: redirect to user action
        return {
            'type': 'ir.actions.act_window',
            'name': 'Mi Respuesta de Autoevaluación',
            'res_model': 'ae.survey.answer',
            'view_mode': 'tree,form',
            'view_ids': [(5, 0, 0),
                (0, 0, {'view_mode': 'tree', 'view_id': self.env.ref('cii_autoevaluation.autoevaluation_survey_answer_user_tree').id}),
                (0, 0, {'view_mode': 'form', 'view_id': self.env.ref('cii_autoevaluation.autoevaluation_survey_answer_form').id})],
            'search_view_id': self.env.ref('cii_autoevaluation.autoevaluation_survey_answer_user_search').id,
            'context': {
                'search_default_filter_my_department_only': 1,
                'search_default_filter_active_surveys_only': 1,
                'default_user_id': self.env.uid
            },
            'target': 'current',
        }