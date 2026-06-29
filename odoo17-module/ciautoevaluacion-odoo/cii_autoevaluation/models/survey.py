import logging
import base64
import io
from odoo import models, fields, api, _
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)
class Survey(models.Model):
    _name = "ae.survey"
    _description = "Survey"
    _rec_name = "title"

    title = fields.Char(string="Title")
    description = fields.Text(string="Description")
    initial_date = fields.Date(string="Initial Date")
    status = fields.Selection(
        [
            ("active", "Active"),
            ("inactive", "Inactive"),
            ("pending", "Pending"),
        ],
        default="inactive",
        string="Status",
    )
    final_date = fields.Date(string="Final Date")
    departments = fields.Many2many(
        "hr.department",
        "ae_survey_rel",
        "survey_id",
        "department_id",
        string="Departments",
    )
    components = fields.Many2many(
        "ae.component",
        "ae_survey_component_rel",
        "survey_id",
        "component_id",
        string="Components"
    )
    
    # Related field to show survey answers
    survey_answer_ids = fields.One2many(
        "ae.survey.answer",
        "survey_id",
        string="Survey Answers"
    )
    
    # Computed field to show departments without answer
    departments_without_answer = fields.Many2many(
        "hr.department",
        string="Departments without Answer",
        compute="_compute_departments_without_answer",
        store=False
    )
    
    # Computed field for component response statistics (HTML)
    component_statistics_html = fields.Html(
        string="Statistics by Component",
        compute="_compute_component_statistics_html",
        store=False
    )
     
    notification_sent = fields.Boolean(string="Notification Sent", default=False)
    closed_notification_sent = fields.Boolean(string="Close Notification Sent", default=False)
 
    def send_notification_email(self):
        if len(self) != 1:
            raise UserError("Attention! You can only send notifications for one self-assessment at a time. Please select only one self-assessment.")
        try:
            # Check if mail_utils module is available
            if 'mail_utils' in self.env.registry._init_modules:
                mail_utils = self.env["mail.utils"]
                if hasattr(mail_utils, "send_open_notification_aes"):
                    for survey in self:
                        mail_utils.send_open_notification_aes(survey.id)
                        _logger.info(f"Notification sent for evaluation: {survey.title}")
                else:
                    _logger.warning("The send_open_notification_aes method is not available in mail.utils")
            else:
                _logger.warning("The mail_utils module is not available")
        except Exception as e:
            _logger.error(f"Error sending notification: {str(e)}")

    @api.model
    def create(self, vals):
        """Override create to handle survey creation"""
        record = super().create(vals)
        return record

    def write(self, vals):
        """Override write to handle survey updates"""
        result = super().write(vals)
        return result

    def _create_survey_answers_for_departments(self):
        """Create survey answers for all departments assigned to this survey"""
        for survey in self:
            if survey.departments:
                for department in survey.departments:
                    # Check if survey answer already exists
                    existing_answer = self.env['ae.survey.answer'].search([
                        ('survey_id', '=', survey.id),
                        ('department_id', '=', department.id)
                    ], limit=1)
                    
                    if not existing_answer:
                        self.env['ae.survey.answer'].create({
                            'survey_id': survey.id,
                            'department_id': department.id,
                            'status': 'draft'
                        })
                        _logger.info(f"Survey answer created for survey {survey.title} and department {department.name}")



    @api.depends('departments', 'survey_answer_ids.department_id')
    def _compute_departments_without_answer(self):
        """Compute departments from ALL the DB that are NOT in this survey AND have no answers"""
        Department = self.env['hr.department']
        for survey in self:
            # All departments in the system
            all_departments = Department.search([])

            # Departments already associated with this survey
            included_departments = survey.departments

            # Departments that already have answers associated with this survey
            answered_departments = survey.survey_answer_ids.mapped('department_id')

            # Filter: those not in 'included' and have no answers
            without_answer = all_departments.filtered(
                lambda dept: dept not in included_departments and dept not in answered_departments
            )

            survey.departments_without_answer = without_answer
    
    @api.depends('survey_answer_ids', 'components')
    def _compute_component_statistics_html(self):
        """Calculate positive and negative response statistics by component and generate HTML"""
        for survey in self:
            if not survey.components:
                survey.component_statistics_html = f"""
                <div class="alert alert-info">
                    <i class="fa fa-info-circle me-2"></i>
                    {_("No components defined for this survey.")}
                </div>
                """
                continue

            # Get all answers from this survey across all departments
            answers = self.env['ae.answer'].search([
                ('survey_answer_id.survey_id', '=', survey.id),
                ('response', 'in', ['si', 'no'])  # Only valid responses
            ])

            if not answers:
                survey.component_statistics_html = """
                <div class="alert alert-warning">
                    <i class="fa fa-exclamation-triangle me-2"></i>
                    No se han registrado respuestas para esta encuesta.
                </div>
                """
                continue

            # Calculate statistics by component
            stats_data = []
            total_positive = 0
            total_negative = 0
            total_responses = 0

            for component in survey.components:
                # Get all questions that have this component in their related_components
                component_questions = self.env['ae.question'].search([
                    ('related_components', 'in', [component.id])
                ])

                # Get answers for these questions
                component_answers = answers.filtered(lambda a: a.question_id in component_questions)
                positive_count = len(component_answers.filtered(lambda a: a.response == 'si'))
                negative_count = len(component_answers.filtered(lambda a: a.response == 'no'))
                total_component = positive_count + negative_count

                if total_component > 0:
                    positive_percentage = (positive_count / total_component) * 100
                    negative_percentage = (negative_count / total_component) * 100
                else:
                    positive_percentage = 0
                    negative_percentage = 0

                stats_data.append({
                    'component': component.title,
                    'positive_count': positive_count,
                    'positive_percentage': positive_percentage,
                    'negative_count': negative_count,
                    'negative_percentage': negative_percentage,
                    'total': total_component
                })

                total_positive += positive_count
                total_negative += negative_count
                total_responses += total_component
            
            # Calculate totals
            if total_responses > 0:
                total_positive_percentage = (total_positive / total_responses) * 100
                total_negative_percentage = (total_negative / total_responses) * 100
            else:
                total_positive_percentage = 0
                total_negative_percentage = 0
            
            # Generate Bootstrap table HTML
            html_content = """
            <div class="table-responsive">
                <table class="table table-bordered table-hover table-striped align-middle">
                    <thead class="table-primary">
                        <tr>
                            <th style="width: 30%;">Componente</th>
                            <th class="text-center" style="width: 15%;">Respuestas positivas</th>
                            <th class="text-center" style="width: 12%;">% Positivas</th>
                            <th class="text-center" style="width: 15%;">Respuestas negativas</th>
                            <th class="text-center" style="width: 12%;">% Negativas</th>
                            <th class="text-center" style="width: 16%;">Total de respuestas</th>
                        </tr>
                    </thead>
                    <tbody>
            """
            
            # Add data rows
            for stat in stats_data:
                html_content += f"""
                        <tr>
                            <td class="fw-bold">{stat['component']}</td>
                            <td class="text-center text-success fw-bold">{stat['positive_count']}</td>
                            <td class="text-center text-success fw-bold">{stat['positive_percentage']:.1f}%</td>
                            <td class="text-center text-danger fw-bold">{stat['negative_count']}</td>
                            <td class="text-center text-danger fw-bold">{stat['negative_percentage']:.1f}%</td>
                            <td class="text-center fw-bold">{stat['total']}</td>
                        </tr>
                """
            
            # Add totals row
            html_content += f"""
                        <tr class="table-warning fw-bold">
                            <td>TOTALES</td>
                            <td class="text-center text-success">{total_positive}</td>
                            <td class="text-center text-success">Promedio: <br/>{total_positive_percentage:.1f}%
                            </td>
                            <td class="text-center text-danger">{total_negative}</td>
                            <td class="text-center text-danger">Promedio: <br/>{total_negative_percentage:.1f}%
                            </td>
                            <td class="text-center">{total_responses}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            """
            
            survey.component_statistics_html = html_content

    def get_component_statistics_data(self):
        """Returns component statistics data in structured format for Excel"""
        self.ensure_one()

        if not self.components:
            return []

        # Get all answers from this survey across all departments
        answers = self.env['ae.answer'].search([
            ('survey_answer_id.survey_id', '=', self.id),
            ('response', 'in', ['si', 'no'])  # Only valid responses
        ])

        if not answers:
            return []

        # Calculate statistics by component
        stats_data = []
        total_positive = 0
        total_negative = 0
        total_responses = 0

        for component in self.components:
            # Get all questions that have this component in their related_components
            component_questions = self.env['ae.question'].search([
                ('related_components', 'in', [component.id])
            ])

            # Get answers for these questions
            component_answers = answers.filtered(lambda a: a.question_id in component_questions)
            positive_count = len(component_answers.filtered(lambda a: a.response == 'si'))
            negative_count = len(component_answers.filtered(lambda a: a.response == 'no'))
            total_component = positive_count + negative_count

            if total_component > 0:
                positive_percentage = (positive_count / total_component) * 100
                negative_percentage = (negative_count / total_component) * 100
            else:
                positive_percentage = 0
                negative_percentage = 0

            stats_data.append({
                'component': component.title,
                'positive_count': positive_count,
                'positive_percentage': positive_percentage,
                'negative_count': negative_count,
                'negative_percentage': negative_percentage,
                'total': total_component
            })

            total_positive += positive_count
            total_negative += negative_count
            total_responses += total_component
        
        # Calculate totals
        if total_responses > 0:
            total_positive_percentage = (total_positive / total_responses) * 100
            total_negative_percentage = (total_negative / total_responses) * 100
        else:
            total_positive_percentage = 0
            total_negative_percentage = 0
        
        # Add totals row
        stats_data.append({
            'component': 'TOTALS',
            'positive_count': total_positive,
            'positive_percentage': total_positive_percentage,
            'negative_count': total_negative,
            'negative_percentage': total_negative_percentage,
            'total': total_responses
        })
        
        return stats_data

    def get_top_questions_by_response_type(self):
        """Returns top 5 questions with most positive and negative responses"""
        self.ensure_one()

        # Get all answers from this survey across all departments
        answers = self.env['ae.answer'].search([
            ('survey_answer_id.survey_id', '=', self.id),
            ('response', 'in', ['si', 'no'])  # Only valid responses
        ])

        if not answers:
            return {
                'top_positive': [],
                'top_negative': []
            }

        # Group answers by question
        question_stats = {}

        for answer in answers:
            question_id = answer.question_id.id
            if question_id not in question_stats:
                question_stats[question_id] = {
                    'question_id': question_id,
                    'title': answer.question_id.title,
                    'positive_count': 0,
                    'negative_count': 0,
                    'total_count': 0
                }

            if answer.response == 'si':
                question_stats[question_id]['positive_count'] += 1
            elif answer.response == 'no':
                question_stats[question_id]['negative_count'] += 1

            question_stats[question_id]['total_count'] += 1

        # Get top 5 questions with most positive responses
        top_positive = sorted(
            question_stats.values(),
            key=lambda x: x['positive_count'],
            reverse=True
        )[:5]

        # Get top 5 questions with most negative responses
        top_negative = sorted(
            question_stats.values(),
            key=lambda x: x['negative_count'],
            reverse=True
        )[:5]

        return {
            'top_positive': top_positive,
            'top_negative': top_negative
        }

    def get_top_departments_by_sentiment(self):
        """Returns top 5 most optimistic and pessimistic departments"""
        self.ensure_one()

        # Get all survey answers for this survey
        survey_answers = self.env['ae.survey.answer'].search([
            ('survey_id', '=', self.id),
            ('status', '=', 'submitted')  # Only submitted surveys
        ])

        if not survey_answers:
            return {
                'most_optimistic': [],
                'most_pessimistic': []
            }

        # Calculate sentiment for each department
        department_sentiments = {}

        for survey_answer in survey_answers:
            dept_id = survey_answer.department_id.id
            if dept_id not in department_sentiments:
                department_sentiments[dept_id] = {
                    'department_id': dept_id,
                    'department_name': survey_answer.department_id.name,
                    'manager_name': survey_answer.department_id.manager_id.name if survey_answer.department_id.manager_id else 'Sin Gerente',
                    'positive_count': 0,
                    'negative_count': 0,
                    'total_count': 0,
                    'optimism_score': 0.0  # (positive - negative) / total * 100
                }

            # Get answers for this department survey
            dept_answers = self.env['ae.answer'].search([
                ('survey_answer_id', '=', survey_answer.id),
                ('response', 'in', ['si', 'no'])
            ])

            for answer in dept_answers:
                if answer.response == 'si':
                    department_sentiments[dept_id]['positive_count'] += 1
                elif answer.response == 'no':
                    department_sentiments[dept_id]['negative_count'] += 1

                department_sentiments[dept_id]['total_count'] += 1

        # Calculate optimism score for each department
        for dept_data in department_sentiments.values():
            if dept_data['total_count'] > 0:
                dept_data['optimism_score'] = (
                    (dept_data['positive_count'] - dept_data['negative_count']) /
                    dept_data['total_count']
                ) * 100

        # Sort by optimism score (highest first for optimistic, lowest first for pessimistic)
        most_optimistic = sorted(
            department_sentiments.values(),
            key=lambda x: x['optimism_score'],
            reverse=True
        )[:5]

        most_pessimistic = sorted(
            department_sentiments.values(),
            key=lambda x: x['optimism_score']
        )[:5]

        return {
            'most_optimistic': most_optimistic,
            'most_pessimistic': most_pessimistic
        }

    def get_detailed_question_statistics_by_component(self):
        """Returns detailed statistics by question for each component"""
        self.ensure_one()

        if not self.components:
            return {}

        # Get all answers from this survey
        answers = self.env['ae.answer'].search([
            ('survey_id', '=', self.id),
            ('response', 'in', ['si', 'no'])  # Only valid responses
        ])

        if not answers:
            return {}

        # Group by component
        detailed_stats = {}

        for component in self.components:
            # Get all questions for this component
            questions = self.env['ae.question'].search([
                ('related_components', 'in', [component.id])
            ])

            if not questions:
                continue

            component_stats = []

            for question in questions:
                # Get answers for this question
                question_answers = answers.filtered(lambda a: a.question_id == question)
                positive_count = len(question_answers.filtered(lambda a: a.response == 'si'))
                negative_count = len(question_answers.filtered(lambda a: a.response == 'no'))
                total_responses = positive_count + negative_count

                component_stats.append({
                    'question_title': question.title or 'No title',
                    'positive_count': positive_count,
                    'negative_count': negative_count,
                    'total_responses': total_responses
                })

            detailed_stats[component.title] = component_stats

        return detailed_stats

    def action_create_survey_answers_wizard(self):
        """Open wizard to create survey answers for departments"""
        return {
            'type': 'ir.actions.act_window',
            'name': 'Create Survey Answers',
            'res_model': 'ae.survey.answer.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_survey_id': self.id,
                'default_department_ids': [(6, 0, self.departments.ids)]
            }
        }

    def action_recalculate_statistics(self):
        """Force recalculation of component statistics"""
        self.ensure_one()
        try:
            # Invalidate the computed field to force recalculation
            self.invalidate_model(['component_statistics_html'])
            # Trigger recomputation
            self._compute_component_statistics_html()
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Success'),
                    'message': _('Statistics have been recalculated successfully.'),
                    'type': 'success',
                    'sticky': False,
                }
            }
        except Exception as e:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Error'),
                    'message': _('Error recalculating statistics: %s') % str(e),
                    'type': 'danger',
                    'sticky': True,
                }
            }
    
    def action_export_responses_to_excel(self):
        """Export survey responses by department to Excel including departments without responses"""
        self.ensure_one()
        
        # Try to use xlsxwriter first, fallback to CSV if not available
        try:
            import xlsxwriter
            return self._export_to_excel_xlsxwriter()
        except ImportError:
            _logger.warning("xlsxwriter not available, falling back to CSV export")
            return self._export_to_csv()
        except Exception as e:
            _logger.error(f"Error with xlsxwriter export: {str(e)}")
            return self._export_to_csv()
    
    def action_export_component_statistics_to_excel(self):
        """Export component statistics to Excel"""
        self.ensure_one()
        
        # Try to use xlsxwriter first, fallback to CSV if not available
        try:
            import xlsxwriter
            return self._export_component_statistics_to_excel_xlsxwriter()
        except ImportError:
            _logger.warning("xlsxwriter not available, falling back to CSV export")
            return self._export_component_statistics_to_csv()
        except Exception as e:
            _logger.error(f"Error with xlsxwriter export: {str(e)}")
            return self._export_component_statistics_to_csv()
    
    def export_component_statistics(self):
        """Alternative method name for exporting component statistics to Excel"""
        return self.action_export_component_statistics_to_excel()
    
    def _export_to_excel_xlsxwriter(self):
        """Export to Excel using xlsxwriter"""
        try:
            import xlsxwriter
            
            # Create Excel file in memory
            output = io.BytesIO()
            workbook = xlsxwriter.Workbook(output)
            
            # Define formats
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#4F81BD',
                'font_color': 'white',
                'border': 1,
                'align': 'center',
                'valign': 'vcenter'
            })
            
            data_format = workbook.add_format({
                'border': 1,
                'align': 'left',
                'valign': 'vcenter'
            })
            
            status_format = workbook.add_format({
                'border': 1,
                'align': 'center',
                'valign': 'vcenter'
            })
            
            # Create worksheet for responses
            worksheet = workbook.add_worksheet('Respuestas por Departamento')
            
            # Headers for responses
            headers = [
                'Departamento', 'Gerente', 'Estado', 'Progreso (%)',
                'Preguntas Respondidas', 'Total Preguntas', 'Justificaciones',
                'Acciones Propuestas', 'Creador', 'Fecha Creación'
            ]
            
            # Write headers
            for col, header in enumerate(headers):
                worksheet.write(0, col, header, header_format)
                worksheet.set_column(col, col, 15)  # Set column width
            
            # Get survey answers for this survey
            survey_answers = self.env['ae.survey.answer'].search([
                ('survey_id', '=', self.id)
            ])
            
            # Write data for responses
            row = 1
            for answer in survey_answers:
                try:
                    worksheet.write(row, 0, answer.department_id.name or '', data_format)
                    worksheet.write(row, 1, answer.manager_id.name or '', data_format)
                    worksheet.write(row, 2, dict(answer._fields['status'].selection).get(answer.status, ''), status_format)
                    worksheet.write(row, 3, f"{answer.progress_percentage:.1f}%", data_format)
                    worksheet.write(row, 4, answer.answered_questions or 0, data_format)
                    worksheet.write(row, 5, answer.total_questions or 0, data_format)
                    worksheet.write(row, 6, answer.justification_count or 0, data_format)
                    worksheet.write(row, 7, answer.proposed_actions_count or 0, data_format)
                    worksheet.write(row, 8, answer.user_id.name or '', data_format)
                    worksheet.write(row, 9, answer.create_date.strftime('%d/%m/%Y %H:%M') if answer.create_date else '', data_format)
                except Exception as e:
                    _logger.error(f"Error writing row {row} for answer {answer.id}: {str(e)}")
                    # Write basic info even if there's an error
                    worksheet.write(row, 0, f"Error: {answer.id}", data_format)
                row += 1
            
            # Create worksheet for departments without responses
            worksheet2 = workbook.add_worksheet('Departamentos sin Respuesta')
            
            # Headers for departments without responses
            headers2 = ['Departamento', 'Gerente']
            
            # Write headers
            for col, header in enumerate(headers2):
                worksheet2.write(0, col, header, header_format)
                worksheet2.set_column(col, col, 20)  # Set column width
            
            # Get departments without responses
            departments_without_answer = self.departments_without_answer
            
            # Write data for departments without responses
            row = 1
            for dept in departments_without_answer:
                worksheet2.write(row, 0, dept.name or '', data_format)
                worksheet2.write(row, 1, dept.manager_id.name or '', data_format)
                row += 1
            
            # Create worksheet for component statistics
            worksheet3 = workbook.add_worksheet('Estadísticas por Componente')
            
            # Headers for component statistics
            headers3 = ['Componente', 'Respuestas Positivas', 'Porcentaje Positivas (%)', 'Respuestas Negativas', 'Porcentaje Negativas (%)', 'Total de Respuestas']

            # Write headers
            for col, header in enumerate(headers3):
                worksheet3.write(0, col, header, header_format)
                worksheet3.set_column(col, col, 20)  # Set column width
            
            # Get component statistics data
            stats_data = self.get_component_statistics_data()
            
            # Write data for component statistics
            row = 1
            for stat in stats_data:
                try:
                    worksheet3.write(row, 0, stat['component'] or '', data_format)
                    worksheet3.write(row, 1, stat['positive_count'], data_format)
                    worksheet3.write(row, 2, f"{stat['positive_percentage']:.1f}", data_format)
                    worksheet3.write(row, 3, stat['negative_count'], data_format)
                    worksheet3.write(row, 4, f"{stat['negative_percentage']:.1f}", data_format)
                    worksheet3.write(row, 5, stat['total'], data_format)
                    
                    # Apply bold format for totals row
                    if stat['component'] == 'TOTALS':
                        bold_format = workbook.add_format({
                            'bold': True,
                            'border': 1,
                            'align': 'left',
                            'valign': 'vcenter',
                            'bg_color': '#E6E6E6'
                        })
                        # Re-write the row with bold format
                        worksheet3.write(row, 0, stat['component'] or '', bold_format)
                        worksheet3.write(row, 1, stat['positive_count'], bold_format)
                        worksheet3.write(row, 2, f"{stat['positive_percentage']:.1f}", bold_format)
                        worksheet3.write(row, 3, stat['negative_count'], bold_format)
                        worksheet3.write(row, 4, f"{stat['negative_percentage']:.1f}", bold_format)
                        worksheet3.write(row, 5, stat['total'], bold_format)
                except Exception as e:
                    _logger.error(f"Error writing statistics row {row}: {str(e)}")
                row += 1
            
            workbook.close()
            
            # Get the Excel file content
            excel_data = output.getvalue()
            
            # Create attachment
            safe_title = (self.title or 'Survey').replace(' ', '_').replace('/', '_').replace('\\', '_')
            filename = f"Survey Answers_{safe_title}_{fields.Date.today()}.xlsx"
            
            attachment = self.env['ir.attachment'].create({
                'name': filename,
                'type': 'binary',
                'datas': base64.b64encode(excel_data),
                'res_model': self._name,
                'res_id': self.id,
            })
            
            # Return download action
            return {
                'type': 'ir.actions.act_url',
                'url': f'/web/content/{attachment.id}?download=true',
                'target': 'self',
            }
            
        except Exception as e:
            _logger.error(f"Error exporting to Excel: {str(e)}")
            raise UserError(f"Error exporting to Excel: {str(e)}")
    
    def _export_to_csv(self):
        """Export to CSV as fallback when xlsxwriter is not available"""
        try:
            import csv
            
            # Create CSV file in memory
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write responses data
            writer.writerow(['=== RESPUESTAS POR DEPARTAMENTO ==='])
            writer.writerow([
                'Departamento', 'Gerente', 'Estado', 'Progreso (%)',
                'Preguntas Respondidas', 'Total Preguntas', 'Justificaciones',
                'Acciones Propuestas', 'Creador', 'Fecha Creación'
            ])
            
            # Get survey answers for this survey
            survey_answers = self.env['ae.survey.answer'].search([
                ('survey_id', '=', self.id)
            ])
            
            # Write data for responses
            for answer in survey_answers:
                try:
                    writer.writerow([
                        answer.department_id.name or '',
                        answer.manager_id.name or '',
                        dict(answer._fields['status'].selection).get(answer.status, ''),
                        f"{answer.progress_percentage:.1f}%",
                        answer.answered_questions or 0,
                        answer.total_questions or 0,
                        answer.justification_count or 0,
                        answer.proposed_actions_count or 0,
                        answer.user_id.name or '',
                        answer.create_date.strftime('%d/%m/%Y %H:%M') if answer.create_date else ''
                    ])
                except Exception as e:
                    _logger.error(f"Error writing CSV row for answer {answer.id}: {str(e)}")
                    writer.writerow([f"Error: {answer.id}", '', '', '', '', '', '', '', '', ''])
            
            # Write departments without responses
            writer.writerow([])
            writer.writerow(['=== DEPARTAMENTOS SIN RESPUESTA ==='])
            writer.writerow(['Departamento', 'Gerente'])
            
            departments_without_answer = self.departments_without_answer
            for dept in departments_without_answer:
                writer.writerow([
                    dept.name or '',
                    dept.manager_id.name or ''
                ])
             
            # Get CSV content
            csv_data = output.getvalue()
            
            # Create attachment
            safe_title = (self.title or 'Survey').replace(' ', '_').replace('/', '_').replace('\\', '_')
            filename = f"Survey Answers_{safe_title}_{fields.Date.today()}.csv"
            
            attachment = self.env['ir.attachment'].create({
                'name': filename,
                'type': 'binary',
                'datas': base64.b64encode(csv_data.encode('utf-8')),
                'res_model': self._name,
                'res_id': self.id,
            })
            
            # Return download action
            return {
                'type': 'ir.actions.act_url',
                'url': f'/web/content/{attachment.id}?download=true',
                'target': 'self',
            }
            
        except Exception as e:
            _logger.error(f"Error exporting to CSV: {str(e)}")
            raise UserError(f"Error exporting to CSV: {str(e)}")
    
    def _export_component_statistics_to_excel_xlsxwriter(self):
        """Export component statistics to Excel using xlsxwriter"""
        try:
            import xlsxwriter
            
            # Create Excel file in memory
            output = io.BytesIO()
            workbook = xlsxwriter.Workbook(output)
            
            # Define formats
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#4F81BD',
                'font_color': 'white',
                'border': 1,
                'align': 'center',
                'valign': 'vcenter'
            })
            
            data_format = workbook.add_format({
                'border': 1,
                'align': 'left',
                'valign': 'vcenter'
            })
            
            totals_format = workbook.add_format({
                'bold': True,
                'border': 1,
                'align': 'left',
                'valign': 'vcenter',
                'bg_color': '#E6E6E6'
            })
            
            # Create worksheet for component statistics
            worksheet = workbook.add_worksheet('Estadísticas por Componente')

            # Headers for component statistics
            headers = ['Componente', 'Respuestas Positivas', 'Porcentaje Positivas (%)', 'Respuestas Negativas', 'Porcentaje Negativas (%)', 'Total de Respuestas']

            # Write headers
            for col, header in enumerate(headers):
                worksheet.write(0, col, header, header_format)
                worksheet.set_column(col, col, 20)  # Set column width
            
            # Get component statistics data
            stats_data = self.get_component_statistics_data()
            
            # Write data for component statistics
            row = 1
            for stat in stats_data:
                try:
                    # Choose format based on whether it's totals row
                    current_format = totals_format if stat['component'] == 'TOTALS' else data_format
                    
                    worksheet.write(row, 0, stat['component'] or '', current_format)
                    worksheet.write(row, 1, stat['positive_count'], current_format)
                    worksheet.write(row, 2, f"{stat['positive_percentage']:.1f}", current_format)
                    worksheet.write(row, 3, stat['negative_count'], current_format)
                    worksheet.write(row, 4, f"{stat['negative_percentage']:.1f}", current_format)
                    worksheet.write(row, 5, stat['total'], current_format)
                except Exception as e:
                    _logger.error(f"Error writing statistics row {row}: {str(e)}")
                row += 1
            
            # Chart only for general totals (Positive vs Negative)
            totals_row = next((stat for stat in stats_data if stat['component'] == 'TOTALS'), None)
            if totals_row:
                chart_start_row = row + 2
                worksheet.merge_range(chart_start_row, 0, chart_start_row, 1, 'Gráfico de Respuestas Totales', header_format)
                # Write category names and values
                chart_data_row = chart_start_row + 1
                worksheet.write_string(chart_data_row, 0, 'Total Respuestas Positivas')
                worksheet.write_number(chart_data_row, 1, totals_row['positive_count'])
                worksheet.write_string(chart_data_row + 1, 0, 'Total Respuestas Negativas')
                worksheet.write_number(chart_data_row + 1, 1, totals_row['negative_count'])
                # Create chart with single series and custom categories
                chart = workbook.add_chart({'type': 'column'})
                chart.add_series({
                    'name': 'Total Respuestas', 
                    'categories': ['Estadísticas por Componente', chart_data_row, 0, chart_data_row + 1, 0],
                    'values':     ['Estadísticas por Componente', chart_data_row, 1, chart_data_row + 1, 1],
                    'data_labels': {'value': True}, 
                    'fill': {'color': '#42A5F5'},
                    'border': {'color': '#1565C0'}
                })
                chart.set_title({'name': 'Total Respuestas'})
                chart.set_x_axis({'name': '', 'num_font': {'size': 10}})
                chart.set_y_axis({'name': '', 'num_font': {'size': 10}})
                chart.set_legend({'none': True})
                chart.set_size({'width': 400, 'height': 300})
                worksheet.insert_chart(chart_data_row + 3, 0, chart)

            # Add detailed tables by component at the end
            detailed_stats = self.get_detailed_question_statistics_by_component()
            
            if detailed_stats:
                # Create a new worksheet for detailed tables
                detail_worksheet = workbook.add_worksheet('Detalle por Pregunta')
                
                # Define format for component titles
                component_title_format = workbook.add_format({
                    'bold': True,
                    'bg_color': '#2E86AB',
                    'font_color': 'white',
                    'border': 1,
                    'align': 'center',
                    'valign': 'vcenter',
                    'font_size': 14
                })
                
                # Define format for table headers
                table_header_format = workbook.add_format({
                    'bold': True,
                    'bg_color': '#A23B72',
                    'font_color': 'white',
                    'border': 1,
                    'align': 'center',
                    'valign': 'vcenter'
                })
                
                # Define format for table data
                table_data_format = workbook.add_format({
                    'border': 1,
                    'align': 'left',
                    'valign': 'vcenter'
                })
                
                # Define format for numbers
                number_format = workbook.add_format({
                    'border': 1,
                    'align': 'center',
                    'valign': 'vcenter'
                })
                
                current_row = 0
                
                for component_title, questions_data in detailed_stats.items():
                    if not questions_data:
                        continue
                    
                    # Component title
                    detail_worksheet.merge_range(current_row, 0, current_row, 3, 
                                               f"Resultados por cada pregunta del componente {component_title}", 
                                               component_title_format)
                    current_row += 1
                    
                    # Table headers
                    headers = ['Pregunta', 'Respuestas Positivas', 'Respuestas Negativas', 'Total Respuestas']
                    for col, header in enumerate(headers):
                        detail_worksheet.write(current_row, col, header, table_header_format)
                        if col == 0:
                            detail_worksheet.set_column(col, col, 50)  # Question wider
                        else:
                            detail_worksheet.set_column(col, col, 20)
                    current_row += 1
                    
                    # Question data
                    for question_data in questions_data:
                        detail_worksheet.write(current_row, 0, question_data['question_title'], table_data_format)
                        detail_worksheet.write(current_row, 1, question_data['positive_count'], number_format)
                        detail_worksheet.write(current_row, 2, question_data['negative_count'], number_format)
                        detail_worksheet.write(current_row, 3, question_data['total_responses'], number_format)
                        current_row += 1
                    
                    # Calculate component totals for chart
                    total_positive_component = sum(q['positive_count'] for q in questions_data)
                    total_negative_component = sum(q['negative_count'] for q in questions_data)
                    total_responses_component = total_positive_component + total_negative_component
                    
                    # Add component pie chart
                    if total_responses_component > 0:
                        # Write chart data (in separate columns)
                        chart_data_row = current_row + 2
                        detail_worksheet.write_string(chart_data_row, 5, 'Tipo de Respuesta')
                        detail_worksheet.write_string(chart_data_row, 6, 'Cantidad')
                        detail_worksheet.write_string(chart_data_row + 1, 5, 'Positiva')
                        detail_worksheet.write_number(chart_data_row + 1, 6, total_positive_component)
                        detail_worksheet.write_string(chart_data_row + 2, 5, 'Negativa')
                        detail_worksheet.write_number(chart_data_row + 2, 6, total_negative_component)
                        
                        # Create pie chart
                        try:
                            chart = workbook.add_chart({'type': 'pie'})
                            chart.add_series({
                                'name': f'Respuestas {component_title}',
                                'categories': ['Detalle por Pregunta', chart_data_row + 1, 5, chart_data_row + 2, 5],
                                'values': ['Detalle por Pregunta', chart_data_row + 1, 6, chart_data_row + 2, 6],
                                'data_labels': {
                                    'percentage': True,
                                    'value': True,
                                    'category': True,
                                    'position': 'outside_end'
                                },
                                'points': [
                                    {'fill': {'color': '#4CAF50'}},  # Verde para positivos
                                    {'fill': {'color': '#F44336'}},  # Rojo para negativos
                                ]
                            })

                            chart.set_title({
                                'name': f'Distribución de Respuestas - {component_title}',
                                'name_font': {'size': 12, 'bold': True}
                            })
                            chart.set_size({'width': 350, 'height': 250})
                            chart.set_legend({'position': 'right'})

                            # Insert graph after the table - use column 5 instead of 8 to avoid conflicts
                            detail_worksheet.insert_chart(current_row + 1, 5, chart)

                        except Exception as chart_error:
                            # If chart creation fails, add a text note
                            detail_worksheet.write(current_row + 1, 5, f'Error al crear gráfico: {str(chart_error)}')
                    
                    # Space between axes
                    current_row += 8  # More space to order the graph

            # Add new worksheet for top 5 positive and negative questions
            top_questions_worksheet = workbook.add_worksheet('Top 5 Preguntas')

            # Format for section titles
            section_title_format = workbook.add_format({
                'bold': True,
                'bg_color': '#4CAF50',
                'font_color': 'white',
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'font_size': 14
            })

            # Format for table headers
            top_header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#2196F3',
                'font_color': 'white',
                'border': 1,
                'align': 'center',
                'valign': 'vcenter'
            })

            # Format for positive data
            positive_format = workbook.add_format({
                'border': 1,
                'align': 'left',
                'valign': 'vcenter',
                'bg_color': '#E8F5E8'
            })

            # Format for negative data
            negative_format = workbook.add_format({
                'border': 1,
                'align': 'left',
                'valign': 'vcenter',
                'bg_color': '#FFEBEE'
            })

            # Get top questions data
            top_questions_data = self.get_top_questions_by_response_type()
            current_row = 0

            # Section: Top 5 preguntas con más respuestas positivas
            top_questions_worksheet.merge_range(current_row, 0, current_row, 4,
                                              'Top 5 Preguntas con Más Respuestas Positivas', section_title_format)
            current_row += 1

            # Headers for positive questions
            positive_headers = ['#', 'Pregunta', 'Respuestas Positivas', 'Respuestas Negativas', 'Total']
            for col, header in enumerate(positive_headers):
                top_questions_worksheet.write(current_row, col, header, top_header_format)
                top_questions_worksheet.set_column(col, col, 25 if col == 1 else 15)
            current_row += 1

            # Data for positive questions
            for i, question in enumerate(top_questions_data['top_positive'], 1):
                top_questions_worksheet.write(current_row, 0, i, positive_format)
                top_questions_worksheet.write(current_row, 1, question['title'], positive_format)
                top_questions_worksheet.write(current_row, 2, question['positive_count'], positive_format)
                top_questions_worksheet.write(current_row, 3, question['negative_count'], positive_format)
                top_questions_worksheet.write(current_row, 4, question['total_count'], positive_format)
                current_row += 1

            # Add empty row
            current_row += 2

            # Section: Top 5 preguntas con más respuestas negativas
            top_questions_worksheet.merge_range(current_row, 0, current_row, 4,
                                              'Top 5 Preguntas con Más Respuestas Negativas', section_title_format)
            current_row += 1

            # Headers for negative questions
            negative_headers = ['#', 'Pregunta', 'Respuestas Negativas', 'Respuestas Positivas', 'Total']
            for col, header in enumerate(negative_headers):
                top_questions_worksheet.write(current_row, col, header, top_header_format)
            current_row += 1

            # Data for negative questions
            for i, question in enumerate(top_questions_data['top_negative'], 1):
                top_questions_worksheet.write(current_row, 0, i, negative_format)
                top_questions_worksheet.write(current_row, 1, question['title'], negative_format)
                top_questions_worksheet.write(current_row, 2, question['negative_count'], negative_format)
                top_questions_worksheet.write(current_row, 3, question['positive_count'], negative_format)
                top_questions_worksheet.write(current_row, 4, question['total_count'], negative_format)
                current_row += 1

            # Add new worksheet for top 5 optimistic and pessimistic departments
            dept_sentiment_worksheet = workbook.add_worksheet('Análisis Departamentos')

            # Format for department section titles
            dept_section_format = workbook.add_format({
                'bold': True,
                'bg_color': '#FF9800',
                'font_color': 'white',
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'font_size': 14
            })

            # Format for department headers
            dept_header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#3F51B5',
                'font_color': 'white',
                'border': 1,
                'align': 'center',
                'valign': 'vcenter'
            })

            # Format for optimistic departments
            optimistic_format = workbook.add_format({
                'border': 1,
                'align': 'left',
                'valign': 'vcenter',
                'bg_color': '#E8F5E9'
            })

            # Format for pessimistic departments
            pessimistic_format = workbook.add_format({
                'border': 1,
                'align': 'left',
                'valign': 'vcenter',
                'bg_color': '#FFEBEE'
            })

            # Format for scores
            score_format = workbook.add_format({
                'border': 1,
                'align': 'center',
                'valign': 'vcenter',
                'num_format': '0.0%'
            })

            # Get department sentiment data
            dept_sentiment_data = self.get_top_departments_by_sentiment()
            current_row = 0

            # Section: Top 5 departamentos más optimistas
            dept_sentiment_worksheet.merge_range(current_row, 0, current_row, 5,
                                              'Top 5 Departamentos Más Optimistas', dept_section_format)
            current_row += 1

            # Headers for optimistic departments
            optimistic_headers = ['#', 'Departamento', 'Gerente', 'Puntuación Optimismo', 'Respuestas Positivas', 'Respuestas Negativas', 'Total']
            for col, header in enumerate(optimistic_headers):
                dept_sentiment_worksheet.write(current_row, col, header, dept_header_format)
                dept_sentiment_worksheet.set_column(col, col, 25 if col in [1, 2] else 18)
            current_row += 1

            # Data for optimistic departments
            for i, dept in enumerate(dept_sentiment_data['most_optimistic'], 1):
                optimism_percentage = dept['optimism_score'] / 100
                dept_sentiment_worksheet.write(current_row, 0, i, optimistic_format)
                dept_sentiment_worksheet.write(current_row, 1, dept['department_name'], optimistic_format)
                dept_sentiment_worksheet.write(current_row, 2, dept['manager_name'], optimistic_format)
                dept_sentiment_worksheet.write(current_row, 3, optimism_percentage, score_format)
                dept_sentiment_worksheet.write(current_row, 4, dept['positive_count'], optimistic_format)
                dept_sentiment_worksheet.write(current_row, 5, dept['negative_count'], optimistic_format)
                dept_sentiment_worksheet.write(current_row, 6, dept['total_count'], optimistic_format)
                current_row += 1

            # Add empty row
            current_row += 2

            # Section: Top 5 departamentos más pesimistas
            dept_sentiment_worksheet.merge_range(current_row, 0, current_row, 5,
                                              'Top 5 Departamentos Más Pesimistas', dept_section_format)
            current_row += 1

            # Headers for pessimistic departments
            pessimistic_headers = ['#', 'Departamento', 'Gerente', 'Puntuación Optimismo', 'Respuestas Negativas', 'Respuestas Positivas', 'Total']
            for col, header in enumerate(pessimistic_headers):
                dept_sentiment_worksheet.write(current_row, col, header, dept_header_format)
            current_row += 1

            # Data for pessimistic departments
            for i, dept in enumerate(dept_sentiment_data['most_pessimistic'], 1):
                optimism_percentage = dept['optimism_score'] / 100
                dept_sentiment_worksheet.write(current_row, 0, i, pessimistic_format)
                dept_sentiment_worksheet.write(current_row, 1, dept['department_name'], pessimistic_format)
                dept_sentiment_worksheet.write(current_row, 2, dept['manager_name'], pessimistic_format)
                dept_sentiment_worksheet.write(current_row, 3, optimism_percentage, score_format)
                dept_sentiment_worksheet.write(current_row, 4, dept['negative_count'], pessimistic_format)
                dept_sentiment_worksheet.write(current_row, 5, dept['positive_count'], pessimistic_format)
                dept_sentiment_worksheet.write(current_row, 6, dept['total_count'], pessimistic_format)
                current_row += 1

            # Add interpretation guide
            current_row += 2
            dept_sentiment_worksheet.merge_range(current_row, 0, current_row, 6,
                                              'Guía de Interpretación:', workbook.add_format({
                                                  'bold': True,
                                                  'bg_color': '#E0E0E0',
                                                  'border': 1,
                                                  'align': 'left',
                                                  'valign': 'vcenter'
                                              }))
            current_row += 1

            guide_text = [
                '• Puntuación Optimismo: Varía de -100% (todas negativas) a +100% (todas positivas)',
                '• Departamentos Optimistas: Mayor proporción de respuestas positivas que negativas',
                '• Departamentos Pesimistas: Mayor proporción de respuestas negativas que positivas',
                '• Análisis basado únicamente en encuestas completadas y enviadas'
            ]

            guide_format = workbook.add_format({
                'border': 1,
                'align': 'left',
                'valign': 'top',
                'font_size': 10
            })

            for text in guide_text:
                dept_sentiment_worksheet.write(current_row, 0, text, guide_format)
                current_row += 1

            workbook.close()
            
            # Get the Excel file content
            excel_data = output.getvalue()
            
            # Create attachment
            safe_title = (self.title or 'Survey').replace(' ', '_').replace('/', '_').replace('\\', '_')
            filename = f"Components Statistics_{safe_title}_{fields.Date.today()}.xlsx"
            
            attachment = self.env['ir.attachment'].create({
                'name': filename,
                'type': 'binary',
                'datas': base64.b64encode(excel_data),
                'res_model': self._name,
                'res_id': self.id,
            })
            
            # Return download action
            return {
                'type': 'ir.actions.act_url',
                'url': f'/web/content/{attachment.id}?download=true',
                'target': 'self',
            }
            
        except Exception as e:
            _logger.error(f"Error exporting component statistics to Excel: {str(e)}")
            raise UserError(f"Error exporting component statistics to Excel: {str(e)}")
    
    def _export_component_statistics_to_csv(self):
        """Export component statistics to CSV as fallback when xlsxwriter is not available"""
        try:
            import csv
            
            # Create CSV file in memory
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write component statistics data
            writer.writerow(['=== ESTADÍSTICAS POR COMPONENTE ==='])
            writer.writerow(['Componente', 'Respuestas Positivas', 'Porcentaje Positivas (%)', 'Respuestas Negativas', 'Porcentaje Negativas (%)', 'Total de Respuestas'])
            
            # Get component statistics data
            stats_data = self.get_component_statistics_data()
            
            # Write data for component statistics
            for stat in stats_data:
                try:
                    writer.writerow([
                        stat['component'] or '',
                        stat['positive_count'],
                        f"{stat['positive_percentage']:.1f}",
                        stat['negative_count'],
                        f"{stat['negative_percentage']:.1f}",
                        stat['total']
                    ])
                except Exception as e:
                    _logger.error(f"Error writing CSV statistics row: {str(e)}")
                    writer.writerow([f"Error: {stat.get('component', 'Unknown')}", '', '', '', '', ''])
            
            # Add detailed tables by components
            detailed_stats = self.get_detailed_question_statistics_by_component()
            
            if detailed_stats:
                writer.writerow([])  # Line in blank
                writer.writerow(['=== DETAIL BY QUESTION ==='])
                
                for component_title, questions_data in detailed_stats.items():
                    if not questions_data:
                        continue
                    
                    writer.writerow([])  # Line in blank
                    writer.writerow([f'Result for each question of component {component_title}'])
                    writer.writerow(['Question', 'Positive Responses', 'Negative Responses', 'Total Responses'])
                    
                    for question_data in questions_data:
                        writer.writerow([
                            question_data['question_title'],
                            question_data['positive_count'],
                            question_data['negative_count'],
                            question_data['total_responses']
                        ])
            
            # Get CSV content
            csv_data = output.getvalue()
            
            # Create attachment
            safe_title = (self.title or 'Survey').replace(' ', '_').replace('/', '_').replace('\\', '_')
            filename = f"Components Statistics_{safe_title}_{fields.Date.today()}.csv"
            
            attachment = self.env['ir.attachment'].create({
                'name': filename,
                'type': 'binary',
                'datas': base64.b64encode(csv_data.encode('utf-8')),
                'res_model': self._name,
                'res_id': self.id,
            })
            
            # Return download action
            return {
                'type': 'ir.actions.act_url',
                'url': f'/web/content/{attachment.id}?download=true',
                'target': 'self',
            }
            
        except Exception as e:
            _logger.error(f"Error exporting component statistics to CSV: {str(e)}")
            raise UserError(f"Error exporting component statistics to CSV: {str(e)}")
    