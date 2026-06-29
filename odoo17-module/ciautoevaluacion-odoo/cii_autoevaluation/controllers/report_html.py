import base64
import io
from odoo import http
from odoo.http import request, content_disposition
from odoo.tools.misc import xlsxwriter
from odoo.tools import html_escape

class SurveyAnswerReportController(http.Controller):
    @http.route('/autoevaluation/survey_answer/html/<int:record_id>', type='http', auth='user')
    def survey_answer_html_report(self, record_id, **kw):
        record = request.env['ae.survey.answer'].sudo().browse(record_id)
        return request.render('cii_autoevaluation.survey_answer_html_report', {'o': record})

    @http.route('/autoevaluation/survey_answer/pdf/<int:record_id>', type='http', auth='user')
    def survey_answer_pdf_report(self, record_id, **kw):
        """Generate PDF report for survey answer"""
        record = request.env['ae.survey.answer'].sudo().browse(record_id)

        if not record.exists():
            raise request.not_found()

        # Check if user has access to this record
        if not record.check_access_rights('read'):
            raise request.not_found()

        # Only allow PDF generation for submitted surveys or AUTOEVALUATION users
        autoevaluation_groups = [
            'cii_autoevaluation.group_autoevaluation_admin',
            'cii_autoevaluation.group_autoevaluation_assessee',
            'cii_autoevaluation.group_autoevaluation_audit',
            'cii_autoevaluation.group_autoevaluation_internal_control'
        ]

        is_autoevaluation_user = any(request.env.user.has_group(group) for group in autoevaluation_groups)

        if record.status != 'submitted' and not is_autoevaluation_user:
            raise request.not_found()

        # Generate HTML content
        html = request.env.ref('cii_autoevaluation.survey_answer_pdf_report')._render({
            'o': record,
        })

        # Convert to PDF using Odoo's report engine
        pdf_content = request.env.ref('cii_autoevaluation.survey_answer_pdf_report')._render_qweb_pdf([record.id])[0]

        # Create response
        pdfhttpheaders = [
            ('Content-Type', 'application/pdf'),
            ('Content-Length', len(pdf_content)),
            ('Content-Disposition', content_disposition(f'autoevaluacion_{record.survey_title}_{record.department_name}_{record.create_date.strftime("%Y%m%d")}.pdf'))
        ]

        return request.make_response(pdf_content, headers=pdfhttpheaders)

    @http.route('/autoevaluation/survey_answer/download_report/<int:record_id>', type='http', auth='user')
    def survey_answer_download_report(self, record_id, **kw):
        """Alternative download method with better error handling"""
        record = request.env['ae.survey.answer'].browse(record_id)

        if not record.exists():
            return request.not_found()

        # Security check - only allow access if user can read the record
        try:
            record.check_access_rights('read')
            record.check_access_rule('read')
        except:
            return request.not_found()

        # Additional security: only allow download for submitted surveys or AUTOEVALUATION users
        autoevaluation_groups = [
            'cii_autoevaluation.group_autoevaluation_admin',
            'cii_autoevaluation.group_autoevaluation_assessee',
            'cii_autoevaluation.group_autoevaluation_audit',
            'cii_autoevaluation.group_autoevaluation_internal_control'
        ]

        is_autoevaluation_user = any(request.env.user.has_group(group) for group in autoevaluation_groups)

        if record.status != 'submitted' and not is_autoevaluation_user:
            return request.not_found()

        # Generate the PDF
        try:
            report = request.env.ref('cii_autoevaluation.action_survey_answer_pdf_report')
            pdf_content, _ = report._render_qweb_pdf([record.id])

            pdfhttpheaders = [
                ('Content-Type', 'application/pdf'),
                ('Content-Length', len(pdf_content)),
                ('Content-Disposition', content_disposition(f'reporte_autoevaluacion_{record.survey_title}_{record.department_name}_{record.create_date.strftime("%d%m%Y")}.pdf'))
            ]

            return request.make_response(pdf_content, headers=pdfhttpheaders)
        except Exception as e:
            # Log error and show user-friendly message
            _logger = request.env['ir.logging'].sudo()
            _logger.create({
                'name': 'survey_answer_pdf',
                'type': 'server',
                'level': 'error',
                'message': f'Error generating PDF for survey answer {record_id}: {str(e)}',
                'dbname': request.env.cr.dbname,
            })

            return request.redirect(f'/web#model=ae.survey.answer&id={record.id}&view_type=form') 