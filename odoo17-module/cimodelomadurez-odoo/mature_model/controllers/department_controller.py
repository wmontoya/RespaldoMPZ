from odoo import http
from odoo.http import request
import json
from werkzeug.wrappers import Response
import logging

_logger = logging.getLogger(__name__)

class ReportController(http.Controller):
    @http.route('/api/v1/department/download_excel_report', type='http', auth='user', methods=['GET'], csrf=False)
    def download_excel_report(self, **kwargs):
        try:
            department_ids_str = kwargs.get('department_ids', '')
            department_evaluation_ids = [int(id) for id in department_ids_str.split(',')] if department_ids_str else []

            if not department_evaluation_ids:
                return Response(
                    json.dumps({"error": "No department evaluation IDs provided."}),
                    content_type="application/json;charset=utf-8",
                    status=404,
                )

            report_service = request.env['report.service'].sudo()
            result, content_type, filename = report_service.generate_excel_report(department_evaluation_ids)

            return Response(
                result,
                headers={
                    'Content-Type': content_type,
                    'Content-Disposition': f'attachment; filename={filename}'
                },
                status=200,
            )

        except Exception as e:
            _logger.error('Error generating Excel report: %s', e, exc_info=True)
            return Response(
                json.dumps({"error": "Error generating report."}),
                content_type="application/json;charset=utf-8",
                status=500,
            )
